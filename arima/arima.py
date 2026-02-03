import sys
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error
from math import sqrt

# ===============================
# PARAMETER DARI NODE
# ===============================
product_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1

# ===============================
# DATABASE (SQLALCHEMY)
# ===============================
engine = create_engine("mysql+pymysql://root:@localhost/koperasi_arima")

# ===============================
# AMBIL DATA HISTORIS
# ===============================
query = text(
    """
    SELECT period, total_sold
    FROM sales_history
    WHERE product_id = :product_id
    ORDER BY period
"""
)

df = pd.read_sql(query, engine, params={"product_id": product_id})

# ===============================
# CEK DATA
# ===============================
if df.empty or len(df) < 10:
    print("Data tidak cukup untuk ARIMA")
    sys.exit()

data = df["total_sold"].astype(int).values

# ===============================
# SPLIT DATA (80% TRAIN, 20% TEST)
# ===============================
train_size = int(len(data) * 0.8)
train, test = data[:train_size], data[train_size:]

# ===============================
# TRAIN MODEL ARIMA
# ===============================
model = ARIMA(train, order=(1, 1, 1))
model_fit = model.fit()

# ===============================
# EVALUASI MODEL
# ===============================
pred_test = model_fit.forecast(steps=len(test))
mae = mean_absolute_error(test, pred_test)
rmse = sqrt(mean_squared_error(test, pred_test))

# ===============================
# SIMPAN HASIL KE DATABASE
# ===============================
with engine.begin() as conn:
    # hapus hasil lama
    conn.execute(
        text("DELETE FROM model_evaluations WHERE product_id = :product_id"),
        {"product_id": product_id},
    )
    conn.execute(
        text("DELETE FROM predictions WHERE product_id = :product_id"),
        {"product_id": product_id},
    )

    # simpan evaluasi
    conn.execute(
        text(
            """
            INSERT INTO model_evaluations (product_id, mae, rmse)
            VALUES (:product_id, :mae, :rmse)
        """
        ),
        {
            "product_id": product_id,
            "mae": float(mae),
            "rmse": float(rmse),
        },
    )

    # ===============================
    # PREDIKSI 4 MINGGU KE DEPAN
    # ===============================
    future = model_fit.forecast(steps=4)

    for i, val in enumerate(future, start=1):
        conn.execute(
            text(
                """
                INSERT INTO predictions (product_id, period, predicted_value)
                VALUES (:product_id, :period, :value)
            """
            ),
            {
                "product_id": product_id,
                "period": f"Minggu+{i}",
                "value": int(round(val)),
            },
        )

# ===============================
# OUTPUT KE CONSOLE (UNTUK NODE)
# ===============================
print("ARIMA selesai untuk product_id:", product_id)
print("MAE:", round(mae, 2))
print("RMSE:", round(rmse, 2))
print("Prediksi 4 minggu:", [int(round(v)) for v in future])
