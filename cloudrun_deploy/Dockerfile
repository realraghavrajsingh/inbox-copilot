FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app and config
COPY . .
COPY .streamlit /app/.streamlit

# Expose port
EXPOSE 8080

# Run Streamlit with custom browser tab title
CMD ["streamlit", "run", "app.py", "--server.port=8080", "--server.address=0.0.0.0", "--server.enableCORS=false", "--server.enableXsrfProtection=false", "--browser.gatherUsageStats=false"]
