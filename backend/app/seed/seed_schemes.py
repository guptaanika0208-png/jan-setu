"""
Seeds the `schemes` table with sample real-world-style government schemes
so the eligibility engine and UI have data to demo against immediately
after setup. Run with:

    python -m app.seed.seed_schemes
"""
from app.db.database import Base, SessionLocal, engine
from app.models.scheme import Scheme

SAMPLE_SCHEMES = [
    dict(
        name="National Scholarship Portal - Post Matric Scholarship",
        department="Ministry of Social Justice and Empowerment",
        category="education",
        short_description="Financial assistance for SC/ST/OBC students pursuing post-matriculation studies.",
        full_description="Provides tuition fee reimbursement and maintenance allowance to students from SC, ST, OBC and EWS categories studying in recognized post-matric institutions.",
        benefits="Up to ₹1,20,000/year covering tuition, hostel, and maintenance costs.",
        official_link="https://scholarships.gov.in",
        icon="FaGraduationCap",
        eligibility_rules={"max_age": 30, "min_age": 16, "income_below": 250000, "categories": ["sc", "st", "obc", "ews"], "occupation_in": ["student"]},
        required_documents=["aadhaar", "income_certificate", "caste_certificate"],
        application_deadline="2026-10-31",
    ),
    dict(
        name="PM Kisan Samman Nidhi",
        department="Ministry of Agriculture and Farmers Welfare",
        category="agriculture",
        short_description="Direct income support of ₹6,000/year to small and marginal farmer families.",
        full_description="Provides income support to all landholding farmer families to supplement their financial needs for agriculture inputs.",
        benefits="₹6,000 per year in three equal installments, transferred directly to bank accounts.",
        official_link="https://pmkisan.gov.in",
        icon="FaTractor",
        eligibility_rules={"occupation_in": ["farmer"], "states": ["ANY"]},
        required_documents=["aadhaar", "land_records"],
        application_deadline="rolling",
    ),
    dict(
        name="Ayushman Bharat - PMJAY",
        department="Ministry of Health and Family Welfare",
        category="health",
        short_description="Health insurance cover of ₹5 lakh per family per year.",
        full_description="Provides free secondary and tertiary healthcare coverage for economically vulnerable families across empanelled hospitals.",
        benefits="Cashless hospitalization coverage up to ₹5,00,000 per family per year.",
        official_link="https://pmjay.gov.in",
        icon="FaHeartbeat",
        eligibility_rules={"income_below": 250000, "categories": ["sc", "st", "obc", "general", "ews"]},
        required_documents=["aadhaar", "income_certificate"],
        application_deadline="rolling",
    ),
    dict(
        name="Pradhan Mantri Awas Yojana (Urban)",
        department="Ministry of Housing and Urban Affairs",
        category="housing",
        short_description="Interest subsidy on home loans for economically weaker sections.",
        full_description="Provides affordable housing to urban poor through interest subsidy on home loans and direct construction assistance.",
        benefits="Interest subsidy up to ₹2.67 lakh on home loans.",
        official_link="https://pmaymis.gov.in",
        icon="FaHome",
        eligibility_rules={"income_below": 600000, "categories": ["ANY"]},
        required_documents=["aadhaar", "income_certificate"],
        application_deadline="rolling",
    ),
    dict(
        name="National Pension Scheme for Traders (NPS-Traders)",
        department="Ministry of Labour and Employment",
        category="pension",
        short_description="Old age pension of ₹3,000/month for small shopkeepers and traders.",
        full_description="A voluntary and contributory pension scheme for small shopkeepers, retail traders, and self-employed persons.",
        benefits="Minimum assured pension of ₹3,000 per month after the age of 60.",
        official_link="https://maandhan.in",
        icon="FaStore",
        eligibility_rules={"min_age": 18, "max_age": 40, "occupation_in": ["trader", "shopkeeper", "self_employed"], "income_below": 1500000},
        required_documents=["aadhaar", "income_certificate"],
        application_deadline="rolling",
    ),
    dict(
        name="Divyangjan Swavalamban Scheme",
        department="Department of Empowerment of Persons with Disabilities",
        category="disability",
        short_description="Financial assistance and skill training for persons with disabilities.",
        full_description="Provides assistive devices, skill development, and micro-financing support for persons with disabilities to promote self-employment.",
        benefits="Assistive devices, skill training stipend, and concessional loans.",
        official_link="https://disabilityaffairs.gov.in",
        icon="FaWheelchair",
        eligibility_rules={"disability_required": True},
        required_documents=["aadhaar", "disability_certificate"],
        application_deadline="rolling",
    ),
    dict(
        name="Beti Bachao Beti Padhao - Sukanya Samriddhi Yojana",
        department="Ministry of Women and Child Development",
        category="women",
        short_description="Savings scheme for the girl child with high interest rate and tax benefits.",
        full_description="A small savings scheme for parents of girl children to build a education/marriage corpus with government-guaranteed high interest.",
        benefits="Interest rate around 8% p.a., tax-free maturity under Section 80C.",
        official_link="https://www.india.gov.in/sukanya-samriddhi-yojana",
        icon="FaFemale",
        eligibility_rules={"max_age": 10, "gender": "female"},
        required_documents=["aadhaar", "birth_certificate"],
        application_deadline="rolling",
    ),
    dict(
        name="Skill India - PMKVY 4.0",
        department="Ministry of Skill Development and Entrepreneurship",
        category="employment",
        short_description="Free skill training and certification for unemployed youth.",
        full_description="Offers industry-relevant vocational training, certification, and placement assistance to youth to improve employability.",
        benefits="Free training + certification + ₹8,000 average placement-linked incentive.",
        official_link="https://pmkvyofficial.org",
        icon="FaTools",
        eligibility_rules={"min_age": 18, "max_age": 35, "occupation_in": ["unemployed", "student"]},
        required_documents=["aadhaar", "education_certificate"],
        application_deadline="rolling",
    ),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Scheme).count() > 0:
            print("Schemes already seeded, skipping.")
            return
        for data in SAMPLE_SCHEMES:
            db.add(Scheme(**data))
        db.commit()
        print(f"Seeded {len(SAMPLE_SCHEMES)} schemes.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
