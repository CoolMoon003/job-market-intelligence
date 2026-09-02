CITY_TO_STATE = {
    "bengaluru": "Karnataka",
    "bangalore": "Karnataka",
    "hyderabad": "Telangana",
    "chennai": "Tamil Nadu",
    "mumbai": "Maharashtra",
    "pune": "Maharashtra",
    "delhi": "Delhi",
    "noida": "Uttar Pradesh",
    "gurugram": "Haryana",
    "gurgaon": "Haryana",
    "kolkata": "West Bengal",
    "ahmedabad": "Gujarat",
    "london": "England",
    "manchester": "England",
    "austin": "Texas",
    "irving": "Texas",
    "princeton": "New Jersey",
    "tokyo": "Tokyo",
    "singapore": "Singapore",
}

STATE_TO_COUNTRY = {
    "Karnataka": "India",
    "Telangana": "India",
    "Tamil Nadu": "India",
    "Maharashtra": "India",
    "Delhi": "India",
    "Uttar Pradesh": "India",
    "Haryana": "India",
    "West Bengal": "India",
    "Gujarat": "India",
    "England": "United Kingdom",
    "Texas": "United States",
    "New Jersey": "United States",
    "Tokyo": "Japan",
    "Singapore": "Singapore",
}


def normalize_location(location: str):
    text = (location or "").lower()

    for city, state in CITY_TO_STATE.items():
        if city in text:
            return {
                "country": STATE_TO_COUNTRY.get(state, "Other"),
                "state": state,
                "city": "Bengaluru" if city in ["bengaluru", "bangalore"] else city.title(),
            }

    if "india" in text or "ind" in text:
        return {"country": "India", "state": "Unknown", "city": "Unknown"}

    if "united states" in text or "usa" in text or "us" in text:
        return {"country": "United States", "state": "Unknown", "city": "Unknown"}

    if "united kingdom" in text or "uk" in text:
        return {"country": "United Kingdom", "state": "Unknown", "city": "Unknown"}

    return {"country": "Other", "state": "Unknown", "city": "Unknown"}