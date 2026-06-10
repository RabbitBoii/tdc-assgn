import json
import random
from datetime import date

random.seed(42)

# ─── Data pools ───────────────────────────────────────────────────────────────

male_first_names = [
    "Arjun","Rohan","Vikram","Aditya","Karan","Rahul","Nikhil","Siddharth","Aarav","Dev",
    "Ishaan","Kabir","Vivek","Pranav","Harsh","Ankit","Varun","Mohit","Kunal","Rajan",
    "Tarun","Abhishek","Manish","Gaurav","Deepak","Saurabh","Akash","Suresh","Ritesh","Yash"
]
female_first_names = [
    "Priya","Ananya","Kavya","Riya","Shreya","Pooja","Neha","Swati","Divya","Meera",
    "Nisha","Tanvi","Aishwarya","Sonal","Deepika","Kritika","Ankita","Simran","Radhika","Isha",
    "Tanya","Preeti","Pallavi","Sneha","Vanya","Mihika","Arya","Trisha","Siya","Nandini"
]
last_names = [
    "Sharma","Patel","Gupta","Singh","Mehta","Joshi","Reddy","Nair","Iyer","Verma",
    "Agarwal","Malhotra","Kapoor","Bhat","Rao","Pillai","Saxena","Mishra","Pandey","Chauhan",
    "Khanna","Bansal","Sinha","Trivedi","Desai","Shah","Kulkarni","Chaudhary","Tiwari","Bose"
]
cities = [
    "Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Ahmedabad",
    "Jaipur","Lucknow","Chandigarh","Surat","Kochi","Indore","Nagpur","Coimbatore"
]
colleges = [
    "IIT Bombay","IIT Delhi","IIT Roorkee","IIT Madras","NIT Trichy","BITS Pilani",
    "Delhi University","Mumbai University","Christ University","Symbiosis Pune",
    "Jadavpur University","Anna University","VIT Vellore","Manipal University",
    "St. Xavier's College","Lady Shri Ram College","Miranda House","Fergusson College"
]
degrees = [
    "B.Tech Computer Science","B.Tech Electronics","B.E. Mechanical","B.Sc Mathematics",
    "BBA","B.Com","BA Economics","MBA","M.Tech","M.Sc Data Science","B.Tech Civil",
    "MBBS","LLB","B.Arch","B.Tech Chemical","B.Sc Physics"
]
companies = [
    "TCS","Infosys","Wipro","HCL Technologies","Tech Mahindra","Accenture","IBM",
    "Google India","Microsoft","Amazon","Flipkart","Zomato","Paytm","HDFC Bank",
    "ICICI Bank","Deloitte","McKinsey","Goldman Sachs","Byju's","Swiggy",
    "Reliance Industries","Tata Consultancy","Cognizant","Capgemini","Oracle"
]
designations = [
    "Software Engineer","Senior Software Engineer","Product Manager","Data Scientist",
    "Business Analyst","Consultant","Investment Banker","Marketing Manager",
    "HR Manager","Operations Manager","UX Designer","DevOps Engineer",
    "Financial Analyst","Project Manager","Team Lead","Associate Consultant",
    "Sales Manager","Content Strategist","Research Analyst","Doctor"
]
religions = ["Hindu","Hindu","Hindu","Hindu","Muslim","Sikh","Christian","Jain","Buddhist"]
castes = [
    "Brahmin","Kshatriya","Vaishya","Kayastha","Rajput","Maratha","Nair","Iyer",
    "Patel","Jat","Arora","Khatri","Bania","Lingayat","Reddy","Other"
]
languages = ["Hindi","English","Tamil","Telugu","Kannada","Malayalam","Bengali","Marathi","Gujarati","Punjabi"]
family_values_opts = ["traditional","moderate","liberal"]
diet_opts = ["vegetarian","non_vegetarian","eggetarian","vegan"]
drinking_opts = ["never","occasionally","regularly"]
smoking_opts = ["never","occasionally","regularly"]
marital_opts = ["never_married","never_married","never_married","divorced","widowed"]
yes_no_maybe = ["yes","no","maybe"]
status_tags = ["new","active","active","active","on_hold","matched"]
family_types = ["nuclear","joint"]
mother_tongues = ["Hindi","Tamil","Telugu","Kannada","Malayalam","Bengali","Marathi","Gujarati","Punjabi","English"]
manglik_opts = ["yes","no","no","no","unknown"]


def random_dob(min_age: int, max_age: int) -> tuple[str, int]:
    today = date.today()
    age = random.randint(min_age, max_age)
    birth_year = today.year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    return f"{birth_year}-{birth_month:02d}-{birth_day:02d}", age


def make_profile(
    pid: str,
    gender: str,
    min_age: int = 24,
    max_age: int = 38,
    is_customer: bool = False,
    index: int = 0,
) -> dict:
    dob, age = random_dob(min_age, max_age)
    first = random.choice(male_first_names if gender == "male" else female_first_names)
    last  = random.choice(last_names)
    city  = random.choice(cities)
    religion = random.choice(religions)

    # Income varies by designation tier
    designation = random.choice(designations)
    if any(k in designation for k in ["Senior","Manager","Product","Data","Investment","Doctor"]):
        income = round(random.uniform(15, 50), 1)
    elif any(k in designation for k in ["Lead","Consultant","Analyst"]):
        income = round(random.uniform(10, 25), 1)
    else:
        income = round(random.uniform(5, 18), 1)

    profile = {
        "id": pid,
        "first_name": first,
        "last_name": last,
        "gender": gender,
        "date_of_birth": dob,
        "age": age,
        "country": "India",
        "city": city,
        "height_cm": random.randint(150, 165) if gender == "female" else random.randint(163, 185),
        "email": f"{first.lower()}.{last.lower()}{random.randint(10,99)}@gmail.com",
        "phone": f"+91 9{random.randint(100000000,999999999)}",
        "undergraduate_college": random.choice(colleges),
        "degree": random.choice(degrees),
        "income_lpa": income,
        "current_company": random.choice(companies),
        "designation": designation,
        "marital_status": random.choice(marital_opts),
        "languages_known": random.sample(languages, random.randint(2, 4)),
        "siblings": random.randint(0, 3),
        "caste": random.choice(castes),
        "religion": religion,
        "want_kids": random.choice(yes_no_maybe),
        "open_to_relocate": random.choice(yes_no_maybe),
        "open_to_pets": random.choice(yes_no_maybe),
        "manglik": random.choice(manglik_opts),
        "mother_tongue": random.choice(mother_tongues),
        "family_type": random.choice(family_types),
        "family_values": random.choice(family_values_opts),
        "diet": random.choice(diet_opts),
        "drinking": random.choice(drinking_opts),
        "smoking": random.choice(smoking_opts),
        "photo_url": f"https://i.pravatar.cc/300?img={random.randint(1, 70)}",
    }

    if is_customer:
        profile["status_tag"] = random.choice(status_tags)
        profile["notes"] = random.choice([
            "Prefers someone from a similar cultural background.",
            "Looking for a partner who values family time.",
            "Very career-driven, wants an equally ambitious partner.",
            "Open to inter-caste but same religion preferred.",
            "Wants to settle abroad in 2-3 years.",
            "Family is very involved in the matchmaking process.",
            "Had one previous match that didn't work out — now more open.",
            None, None,
        ])

    return profile


# ─── Generate customers (30 total, mixed gender) ──────────────────────────────

customers = []

# 15 for priya: mix of male and female
for i in range(1, 16):
    gender = "male" if i <= 9 else "female"
    customers.append(make_profile(
        pid=f"cust_{i:03d}",
        gender=gender,
        min_age=25,
        max_age=36,
        is_customer=True,
        index=i,
    ))

# 15 for arjun: mix of male and female
for i in range(16, 31):
    gender = "male" if i <= 23 else "female"
    customers.append(make_profile(
        pid=f"cust_{i:03d}",
        gender=gender,
        min_age=26,
        max_age=38,
        is_customer=True,
        index=i,
    ))

# ─── Generate profiles pool (120 profiles, balanced gender) ───────────────────

pool = []
for i in range(1, 121):
    gender = "female" if i <= 60 else "male"
    pool.append(make_profile(
        pid=f"pool_{i:03d}",
        gender=gender,
        min_age=22,
        max_age=36,
        is_customer=False,
        index=i,
    ))

# ─── Write files ──────────────────────────────────────────────────────────────

with open("data/customers.json", "w") as f:
    json.dump(customers, f, indent=2)

with open("data/profiles_pool.json", "w") as f:
    json.dump(pool, f, indent=2)

print(f"✅ Generated {len(customers)} customers and {len(pool)} pool profiles")

# Quick sanity check on the algo
import sys
sys.path.insert(0, ".")
from matching.algo import get_ranked_matches

male_customer = next(c for c in customers if c["gender"] == "male")
female_customer = next(c for c in customers if c["gender"] == "female")

male_matches = get_ranked_matches(male_customer, pool)
female_matches = get_ranked_matches(female_customer, pool)

print(f"\n🧪 Sanity check:")
print(f"   Male customer '{male_customer['first_name']}' ({male_customer['age']}yo) → {len(male_matches)} matches found")
if male_matches:
    top = male_matches[0]
    print(f"   Top match: {top['candidate']['first_name']}, score={top['score']}, reasons={top['match_reasons'][:2]}")

print(f"\n   Female customer '{female_customer['first_name']}' ({female_customer['age']}yo) → {len(female_matches)} matches found")
if female_matches:
    top = female_matches[0]
    print(f"   Top match: {top['candidate']['first_name']}, score={top['score']}, reasons={top['match_reasons'][:2]}")
