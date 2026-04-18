import requests
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

BASE_URL = "http://127.0.0.1:8005/api"

def create_fake_pdf(filename, content):
    c = canvas.Canvas(filename, pagesize=letter)
    c.drawString(100, 700, content)
    c.save()

def main():
    print("--- Starting Backend Test ---")
    
    # 1. Create Case
    case_data = {
        "title": "State vs Rajesh",
        "client_name": "Rajesh Sharma",
        "fir_number": "112/2024",
        "case_type": "Criminal",
        "description": "IPC 420 case"
    }
    
    print("\n[1] Testing POST /cases")
    res = requests.post(f"{BASE_URL}/cases", json=case_data)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.json()}")
    
    if res.status_code != 200:
        print("Failed to create case. Exiting.")
        return
        
    case_id = res.json()["id"]

    # 2. Generate 3 Fake Documents
    docs = {
        "FIR_112_2024.pdf": "This is the FIR report for Rajesh Sharma, number 112/2024 involving IPC Section 420.",
        "Legal_Notice.pdf": "Legal Notice served to the respondent regarding the cheating allegations.",
        "Bail_Application.pdf": "Bail application for Rajesh Sharma pleading not guilty under IPC 420."
    }
    
    print("\n[2] Generating and Uploading PDFs")
    for filename, content in docs.items():
        create_fake_pdf(filename, content)
        
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "application/pdf")}
            data = {"case_id": case_id}
            upload_res = requests.post(f"{BASE_URL}/upload", files=files, data=data)
            
        print(f"Uploaded {filename} - Status Code: {upload_res.status_code}")
        print(f"Response: {upload_res.json()}")
        
        # Cleanup local fake pdf
        os.remove(filename)

    # 3. Test RAG /research
    query_data = {
        "query": "What is the FIR number and under which section is Rajesh Sharma charged?"
    }
    
    print("\n[3] Testing POST /research")
    res = requests.post(f"{BASE_URL}/research", json=query_data)
    print(f"Status Code: {res.status_code}")
    print("Response JSON:")
    print(res.json())
    
    print("\n--- Test Completed ---")

if __name__ == "__main__":
    main()
