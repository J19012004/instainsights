@echo off
echo Installing backend requirements...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo.
echo Done. Configure .env, then run:
echo   python seed.py
echo   python -m uvicorn app.main:app --reload
pause
