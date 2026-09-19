module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { phoneNumber } = req.body;

        if (!phoneNumber || phoneNumber.length !== 10) {
            return res.status(400).json({ success: false, message: "Invalid 10-digit number" });
        }

        try {
            const RAPID_API_KEY = "4f113199efmsh82b0825b662cfa5p10d578jsn944a0e3ea3a8";
            const RAPID_API_HOST = "truecaller4.p.rapidapi.com";

            // 🔥 BADA FIX: Wapas wahi URL laga diya jo tumhare pehle screenshot mein tha
            const url = `https://${RAPID_API_HOST}/api/v1/search?phone=91${phoneNumber}`;
            
            const apiResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
                }
            });
            
            const data = await apiResponse.json();

            // 🚨 X-RAY DEBUGGER: Agar API key expire ho gayi ya limit khatam hui, toh direct popup mein dikhega!
            if (data.message) {
                return res.status(200).json({ 
                    success: false, 
                    message: `RapidAPI Error: ${data.message}` 
                });
            }

            let userName = null;
            let userCarrier = null;
            let userCircle = null;

            // Data padhne ka format
            const searchData = data.data || data; 
            
            if (Array.isArray(searchData) && searchData.length > 0) {
                userName = searchData[0].name;
                userCarrier = searchData[0].phones?.[0]?.carrier || searchData[0].carrier;
                userCircle = searchData[0].addresses?.[0]?.city || searchData[0].circle;
            } else if (searchData.name) {
                userName = searchData.name;
                userCarrier = searchData.carrier || searchData.phones?.[0]?.carrier;
                userCircle = searchData.circle || searchData.city || searchData.addresses?.[0]?.city;
            }

            // Agar asli naam mil gaya
            if (userName && userName.trim() !== "") {
                return res.status(200).json({
                    success: true,
                    name: userName,
                    operator: userCarrier || "Not Found",
                    circle: userCircle || "Not Found"
                });
            } else {
                // Agar number wakai mein fake hai ya RapidAPI ne data nahi diya
                return res.status(200).json({ 
                    success: false, 
                    // Yeh code tumhe RapidAPI ka kachha data dikha dega taaki pata chale error kya hai
                    message: "Fake Number ya No Data. API Response: " + JSON.stringify(data).substring(0, 50) 
                });
            }

        } catch (error) {
            return res.status(200).json({ success: false, message: "Server connection failed: " + error.message });
        }
    } else {
        return res.status(405).json({ success: false, message: "Only POST allowed" });
    }
};
