from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_pdf(filename, title, content):
    c = canvas.Canvas(filename, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, 750, title)
    c.setFont("Helvetica", 12)
    
    y = 720
    for line in content.split('\n'):
        c.drawString(100, y, line)
        y -= 20
        if y < 50:
            c.showPage()
            y = 750
            
    c.save()

os.makedirs("test_material", exist_ok=True)

docs = {
    "1_FIR.pdf": ("FIR (First Information Report)", """FIR No: 112/2024
Police Station: Shivajinagar, Pune
Date: 12/03/2024

Complainant: Rajesh Sharma
Accused: Amit Verma

Statement:
I, Rajesh Sharma, resident of Pune, state that Amit Verma approached me in January 2024 claiming he could arrange a business contract for me. He took 5,00,000 from me as an advance payment.

However, after receiving the money, he stopped responding and failed to provide any contract. I later discovered that he had cheated multiple people using similar methods.

Offence:
Cheating and criminal breach of trust under IPC Sections 420 and 406."""),
    
    "2_Witness_Statement.pdf": ("WITNESS STATEMENT", """Witness Name: Suresh Patil
Date: 15/03/2024

Statement:
I know Rajesh Sharma personally. I was present when Amit Verma promised to arrange a business deal and demanded money.

Rajesh transferred 5,00,000 to Amit via bank transfer. After that, Amit stopped answering calls.

I believe Rajesh has been cheated."""),

    "3_Legal_Notice.pdf": ("LEGAL NOTICE", """Date: 20/03/2024
To, Amit Verma

Subject: Recovery of 5,00,000

Sir,
Under instructions from my client Rajesh Sharma, I hereby serve you this legal notice.
You have fraudulently taken 5,00,000 from my client on false promises of arranging a business contract.
Despite repeated requests, you have failed to return the amount.

You are hereby called upon to:
1. Return 5,00,000 within 15 days
2. Compensate for damages

Failing which, my client will initiate legal proceedings under IPC 420 and 406."""),

    "4_Bail_Application.pdf": ("BAIL APPLICATION", """IN THE COURT OF SESSIONS, PUNE
Bail Application No: ___ / 2024

Amit Verma (Applicant) vs State of Maharashtra

1. The applicant has been falsely implicated in FIR No. 112/2024.
2. The dispute is civil in nature and not criminal.
3. The applicant is ready to cooperate with the investigation.
4. The applicant has no prior criminal record.

PRAYER:
It is therefore prayed that this Hon’ble Court may kindly grant bail to the applicant.""")
}

for filename, (title, content) in docs.items():
    create_pdf(f"test_material/{filename}", title, content)
    print(f"Created: {filename}")
