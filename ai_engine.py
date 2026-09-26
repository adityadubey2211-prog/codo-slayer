# ==========================================
# CODO SLAYER - SMART AI ENGINE
# ==========================================


def analyze_complaint(title, description, affected):

    text = (
        title + " " + description
    ).lower()

    # ======================================
    # DEFAULT
    # ======================================

    category = "General Issue"
    department = "General Administration"
    priority = "LOW"
    confidence = 72


    # ======================================
    # CRITICAL SAFETY
    # ======================================

    critical_words = [
        "fire",
        "aag",
        "sparking",
        "spark",
        "open manhole",
        "fallen wire",
        "live wire",
        "gas leak",
        "gas leakage",
        "electric shock",
        "accident",
        "emergency"
    ]

    is_critical = False

    for word in critical_words:

        if word in text:

            is_critical = True
            break


    # ======================================
    # ELECTRICITY
    # ======================================

    electricity_words = [
        "streetlight",
        "street light",
        "electricity",
        "electric",
        "transformer",
        "wire",
        "power cut",
        "power outage",
        "bijli",
        "light nahi",
        "light band",
        "bijli nahi"
    ]

    for word in electricity_words:

        if word in text:

            category = "Electricity"
            department = "Electrical"
            priority = "HIGH"
            confidence = 94

            break


    # ======================================
    # WATER
    # ======================================

    water_words = [
        "water supply",
        "water pipeline",
        "pipeline leakage",
        "water leakage",
        "water leak",
        "water shortage",
        "no water",
        "paani nahi",
        "pani nahi",
        "paani ki problem",
        "water problem",
        "nal mein paani",
        "pipeline"
    ]

    if category == "General Issue":

        for word in water_words:

            if word in text:

                category = "Water Supply"
                department = "Water Department"
                priority = "HIGH"
                confidence = 93

                break


    # ======================================
    # DRAINAGE
    # IMPORTANT:
    # Drainage BEFORE ROAD
    # ======================================

    drainage_words = [
        "drainage",
        "drain",
        "sewage",
        "sewer",
        "nali",
        "nala",
        "gutter",
        "ganda paani",
        "ganda pani",
        "dirty water",
        "wastewater",
        "waterlogging",
        "water logging",
        "water logged",
        "overflowing drain",
        "drain overflow",
        "nali overflow",
        "nala overflow",
        "sewer overflow",
        "sewage overflow"
    ]

    if category == "General Issue":

        for word in drainage_words:

            if word in text:

                category = "Drainage"
                department = "Public Works"
                priority = "MEDIUM"
                confidence = 90

                break


    # ======================================
    # WASTE
    # ======================================

    waste_words = [
        "garbage",
        "waste",
        "trash",
        "dump",
        "rubbish",
        "kachra",
        "kuda",
        "koode",
        "dustbin",
        "garbage collection"
    ]

    if category == "General Issue":

        for word in waste_words:

            if word in text:

                category = "Waste Management"
                department = "Sanitation"
                priority = "MEDIUM"
                confidence = 91

                break


    # ======================================
    # ROAD
    # ======================================

    road_words = [
        "pothole",
        "potholes",
        "damaged road",
        "broken road",
        "road damage",
        "road is damaged",
        "road is broken",
        "road repair",
        "road needs repair",
        "road construction",
        "gaddha",
        "gaddhe",
        "gaddha hai",
        "tooti sadak",
        "kharab sadak",
        "sadak kharab",
        "road kharab"
    ]

    if category == "General Issue":

        for word in road_words:

            if word in text:

                category = "Road"
                department = "Public Works"
                priority = "MEDIUM"
                confidence = 89

                break


    # ======================================
    # SANITATION
    # ======================================

    sanitation_words = [
        "toilet",
        "public toilet",
        "smell",
        "bad smell",
        "hygiene",
        "safai",
        "cleanliness",
        "dirty area"
    ]

    if category == "General Issue":

        for word in sanitation_words:

            if word in text:

                category = "Sanitation"
                department = "Sanitation"
                priority = "MEDIUM"
                confidence = 86

                break


    # ======================================
    # STREET / TRAFFIC
    # ======================================

    traffic_words = [
        "traffic jam",
        "traffic",
        "illegal parking",
        "parking",
        "encroachment",
        "road blocked",
        "roadblock",
        "jam",
        "ambulance cannot",
        "ambulance cannot enter"
    ]

    if category == "General Issue":

        for word in traffic_words:

            if word in text:

                category = "Traffic & Encroachment"
                department = "Traffic Department"
                priority = "HIGH"
                confidence = 87

                break


    # ======================================
    # CRITICAL OVERRIDE
    # ======================================

    if is_critical:

        priority = "CRITICAL"

        if confidence < 96:

            confidence = 96


    # ======================================
    # AFFECTED PEOPLE
    # ======================================

    if affected >= 100:

        if priority == "LOW":

            priority = "MEDIUM"

        elif priority == "MEDIUM":

            priority = "HIGH"


    elif affected >= 50:

        if priority == "MEDIUM":

            priority = "HIGH"


    # ======================================
    # RESULT
    # ======================================

    return {

        "category": category,

        "department": department,

        "priority": priority,

        "confidence": confidence

    }