import sys
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from math import sqrt

# ===============================
# PARAMETER DARI NODE
# ===============================
product_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
steps = int(sys.argv[2]) if len(sys.argv) > 2 else 7  # default 7 hari

# ===============================
# DATABASE
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
# SPLIT DATA
# ===============================
train_size = int(len(data) * 0.8)
train, test = data[:train_size], data[train_size:]

# ===============================
# TRAIN ARIMA
# ===============================
model = ARIMA(train, order=(1, 1, 1))
model_fit = model.fit()

# ===============================
# PREDIKSI TEST SET
# ===============================
pred_test = model_fit.forecast(steps=len(test))

# ===============================
# METRIK EVALUASI
# ===============================
mae = mean_absolute_error(test, pred_test)
mse = mean_squared_error(test, pred_test)
rmse = sqrt(mse)

# MAPE (%)
mape = np.mean(np.abs((test - pred_test) / test)) * 100
accuracy = 100 - mape

# R2 Score
r2 = r2_score(test, pred_test)

# ===============================
# SIMPAN KE DATABASE
# ===============================
with engine.begin() as conn:
    conn.execute(
        text("DELETE FROM model_evaluations WHERE product_id = :id"), {"id": product_id}
    )
    conn.execute(
        text("DELETE FROM predictions WHERE product_id = :id"), {"id": product_id}
    )

    # simpan evaluasi
    conn.execute(
        text(
            """
            INSERT INTO model_evaluations
            (product_id, mae, mse, rmse, mape, accuracy, r2)
            VALUES
            (:product_id, :mae, :mse, :rmse, :mape, :accuracy, :r2)
        """
        ),
        {
            "product_id": product_id,
            "mae": float(mae),
            "mse": float(mse),
            "rmse": float(rmse),
            "mape": float(mape),
            "accuracy": float(accuracy),
            "r2": float(r2),
        },
    )

    # ===============================
    # PREDIKSI MASA DEPAN
    # ===============================
    future = model_fit.forecast(steps=steps)

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
                "period": f"t+{i}",
                "value": int(round(val)),
            },
        )

# ===============================
# OUTPUT KE NODE
# ===============================
print("ARIMA selesai")
print("MAE:", round(mae, 2))
print("MSE:", round(mse, 2))
print("RMSE:", round(rmse, 2))
print("MAPE:", round(mape, 2), "%")
print("Akurasi:", round(accuracy, 2), "%")
print("R2:", round(r2, 3))
print("Prediksi:", [int(round(v)) for v in future])
