def analyze_complaint(title, description, affected):

    text = (title + " " + description).lower()

    category = "General Issue"
    department = "General Administration"
    priority = "LOW"
    confidence = 72

    # Waste
    if (
        "garbage" in text
        or "waste" in text
        or "trash" in text
        or "dump" in text
    ):
        category = "Waste Management"
        department = "Sanitation"
        priority = "MEDIUM"
        confidence = 91

    # Electricity
    elif (
        "streetlight" in text
        or "electric" in text
        or "electricity" in text
        or "transformer" in text
        or "wire" in text
    ):
        category = "Electricity"
        department = "Electrical"
        priority = "HIGH"
        confidence = 94

    # Water
    elif (
        "water" in text
        or "pipeline" in text
        or "leakage" in text
        or "supply" in text
    ):
        category = "Water Supply"
        department = "Water Department"
        priority = "HIGH"
        confidence = 93

    # Road
    elif (
        "road" in text
        or "pothole" in text
        or "damaged" in text
    ):
        category = "Road"
        department = "Public Works"
        priority = "MEDIUM"
        confidence = 89

    # Drainage
    elif (
        "drain" in text
        or "drainage" in text
        or "sewage" in text
    ):
        category = "Drainage"
        department = "Public Works"
        priority = "MEDIUM"
        confidence = 88

    # Critical cases
    if (
        "fire" in text
        or "sparking" in text
        or "open manhole" in text
        or "fallen wire" in text
    ):
        priority = "CRITICAL"
        confidence = 96

    # Affected people rule
    if affected >= 50 and priority == "MEDIUM":
        priority = "HIGH"

    return {
        "category": category,
        "department": department,
        "priority": priority,
        "confidence": confidence
    }