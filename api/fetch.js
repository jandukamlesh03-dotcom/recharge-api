module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.length !== 10) {
            return res.status(400).json({ success: false, message: "Invalid 10-digit number" });
        }

        try {
            const RAPID_API_KEY = "4f113199efmsh82b0825b662cfa5p10d578jsn944a0e3ea3a8";
            const RAPID_API_HOST = "truecaller4.p.rapidapi.com";

            // 🔥 SABSE BADA FIX: Number ke aage +91 lagana zaroori hai (%2B = + in URL)
            const url = `https://${RAPID_API_HOST}/api/v1/getDetails?phone=%2B91${phoneNumber}&countryCode=IN`;
            
            const apiResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
                }
            });
            
            const data = await apiResponse.json();
            
            // 🚨 Naya Feature: Agar API Key ki free limit khatam ho gayi hai toh saaf batayega
            if (data.message && data.message.toLowerCase().includes("exceeded")) {
                return res.status(200).json({ success: false, message: "API Limit Exhausted. Please use a new RapidAPI key." });
            }
            if (data.message && data.message.toLowerCase().includes("unauthorized")) {
                return res.status(200).json({ success: false, message: "Invalid RapidAPI Key." });
            }

            let userName = null;
            let userCarrier = null;
            let userCircle = null;

            // Har format ko parse karne ka solid logic
            const searchData = data.data || data; 
            
            if (Array.isArray(searchData) && searchData.length > 0) {
                userName = searchData[0].name;
                userCarrier = searchData[0].phones?.[0]?.carrier;
                userCircle = searchData[0].addresses?.[0]?.city;
            } else if (searchData.name) {
                userName = searchData.name;
                userCarrier = searchData.carrier || searchData.phones?.[0]?.carrier;
                userCircle = searchData.circle || searchData.city || searchData.addresses?.[0]?.city;
            }

            // Agar asli naam mil gaya (Sirf tabhi green tick aayega)
            if (userName && userName.trim() !== "") {
                return res.status(200).json({
                    success: true,
                    name: userName,
                    operator: userCarrier || "Not Found",
                    circle: userCircle || "Not Found"
                });
            } else {
                // Agar number wakai mein fake hai
                return res.status(200).json({ 
                    success: false, 
                    message: "This number does not exist or is invalid." 
                });
            }

        } catch (error) {
            console.error("API Error:", error);
            return res.status(500).json({ success: false, message: "Server connection failed." });
        }
    } else {
        return res.status(405).json({ success: false, message: "Only POST allowed" });
    }
};
