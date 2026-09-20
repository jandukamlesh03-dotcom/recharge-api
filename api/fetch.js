module.exports = async (req, res) => {
    // CORS (Cross-Origin) ki permission
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
            // Tumhari Nayi API Key
            const API_KEY = "717251bb6606009bc17fc51b8b304332";
            
            // Standard Number Validation API (NumVerify/APILayer format)
            const url = `http://apilayer.net/api/validate?access_key=${API_KEY}&number=91${phoneNumber}&country_code=IN&format=1`;
            
            const apiResponse = await fetch(url);
            const data = await apiResponse.json();

            // Agar API Key galat ho ya limit khatam ho jaye
            if (data.error) {
                return res.status(200).json({ 
                    success: false, 
                    message: "API Error: " + (data.error.info || "Connection failed") 
                });
            }

            // 🚨 STRICT CHECK: Number sach mein exist karta hai ya nahi!
            if (data.valid === true && data.line_type === "mobile") {
                
                // Original Carrier aur Location nikalna
                let operatorName = data.carrier || "Unknown Operator";
                let locationName = data.location || "India";

                // Vercel se Data Wapas Bhejna
                return res.status(200).json({
                    success: true,
                    name: "Verified Customer", // Security ke liye personal name hide rakha hai
                    operator: operatorName,
                    circle: locationName
                });

            } else {
                // Agar number fake (invalid) nikla
                return res.status(200).json({ 
                    success: false, 
                    message: "This number is invalid or does not exist." 
                });
            }

        } catch (error) {
            console.error("Server Error:", error);
            return res.status(200).json({ success: false, message: "Internal server error." });
        }
    } else {
        return res.status(405).json({ success: false, message: "Only POST allowed" });
    }
};
