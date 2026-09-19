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
            // Tumhari RapidAPI Key aur Host
            const RAPID_API_KEY = "4f113199efmsh82b0825b662cfa5p10d578jsn944a0e3ea3a8";
            const RAPID_API_HOST = "truecaller4.p.rapidapi.com";

            // RapidAPI Truecaller URL
            const url = `https://${RAPID_API_HOST}/api/v1/getDetails?phone=${phoneNumber}&countryCode=IN`;
            
            const apiResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
                }
            });
            
            const data = await apiResponse.json();
            
            let userName = null;
            let userCarrier = null;
            let userCircle = null;

            // Sirf 100% Asli Data Parse Karna
            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
                userName = data.data[0].name;
                userCarrier = data.data[0].phones?.[0]?.carrier;
                userCircle = data.data[0].addresses?.[0]?.city;
            } else if (data && data.name) {
                userName = data.name;
                userCarrier = data.carrier || data.phones?.[0]?.carrier;
                userCircle = data.circle || data.city;
            } else if (data && data.data && data.data.name) {
                userName = data.data.name;
                userCarrier = data.data.carrier;
                userCircle = data.data.circle || data.data.city;
            }

            // Agar asli naam milta hai, tabhi success return karo
            if (userName && userName.trim() !== "") {
                return res.status(200).json({
                    success: true,
                    name: userName,
                    operator: userCarrier || "Unknown Operator",
                    circle: userCircle || "Unknown Circle"
                });
            } else {
                // Number fake hai ya data exist nahi karta
                return res.status(200).json({ 
                    success: false, 
                    message: "This number does not exist or is invalid." 
                });
            }

        } catch (error) {
            console.error("API Error:", error);
            return res.status(500).json({ success: false, message: "API connection failed. Please check your RapidAPI limits." });
        }
    } else {
        return res.status(405).json({ success: false, message: "Only POST allowed" });
    }
};
