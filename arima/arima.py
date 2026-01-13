import mysql.connector
import pandas as pd
import numpy as np

from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error
from math import sqrt
import sys

# ===============================
# PARAMETER DARI NODE
# ===============================
product_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1

# ===============================
# KONEKSI DATABASE
# ===============================
db = mysql.connector.connect(
    host="localhost", user="root", password="", database="koperasi_arima"
)
cursor = db.cursor()

# ===============================
# AMBIL DATA
# ===============================
query = """
SELECT period, total_sold
FROM sales_history
WHERE product_id = %s
ORDER BY period
"""
df = pd.read_sql(query, db, params=(product_id,))

data = df["total_sold"].astype(int).values

# ===============================
# SPLIT DATA
# ===============================
train_size = int(len(data) * 0.8)
train, test = data[:train_size], data[train_size:]

# ===============================
# TRAIN ARIMA
# ===============================
# order=(p,d,q) dipilih berdasarkan data uji coba
model = ARIMA(train, order=(1, 1, 1))
model_fit = model.fit()

# ===============================
# EVALUASI
# ===============================
pred_test = model_fit.forecast(steps=len(test))
mae = mean_absolute_error(test, pred_test)
rmse = sqrt(mean_squared_error(test, pred_test))

# simpan evaluasi
cursor.execute(
    "INSERT INTO model_evaluations (product_id, mae, rmse) VALUES (%s,%s,%s)",
    (product_id, mae, rmse),
)

# ===============================
# PREDIKSI 4 MINGGU
# ===============================
future = model_fit.forecast(steps=4)

for i, val in enumerate(future, start=1):
    cursor.execute(
        "INSERT INTO predictions (product_id, period, predicted_value) VALUES (%s,%s,%s)",
        (product_id, f"Minggu+{i}", int(val)),
    )

db.commit()
db.close()
if len(data) < 10:
    print("Data tidak cukup untuk ARIMA")
    exit()
print("ARIMA selesai untuk product_id:", product_id)
