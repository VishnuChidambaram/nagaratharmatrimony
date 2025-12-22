"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { styles, loadFormData, saveFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
import LanguageToggle from "@/app/components/LanguageToggle";
import TamilPopup from "@/app/components/TamilPopup";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import TamilInput from "@/app/components/TamilInput";
import { API_URL } from "@/app/utils/config";
import { normalizeDropdownValue } from "@/app/utils/normalization";

// List of Indian states
const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
];

// Mapping of states to their districts
const districtsByState = {
  "Andhra Pradesh": [
    "Anantapur",
    "Chittoor",
    "East Godavari",
    "Guntur",
    "Krishna",
    "Kurnool",
    "Nellore",
    "Prakasam",
    "Srikakulam",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "Kadapa",
    "Anakapalli",
    "Kakinada",
    "Ongole",
    "Tirupati",
    "Eluru",
    "Nandyal",
    "Rajahmundry",
    "Machilipatnam",
    "Vijayawada",
    "Guntakal",
    "Hindupur",
    "Proddatur",
    "Tenali",
  ],
  "Arunachal Pradesh": [
    "Tawang",
    "West Kameng",
    "East Kameng",
    "Papum Pare",
    "Kurung Kumey",
    "Kra Daadi",
    "Lower Subansiri",
    "Upper Subansiri",
    "West Siang",
    "East Siang",
    "Siang",
    "Upper Siang",
    "Lower Siang",
    "Lower Dibang Valley",
    "Dibang Valley",
    "Anjaw",
    "Lohit",
    "Namsai",
    "Changlang",
    "Tirap",
    "Longding",
  ],
  Assam: [
    "Baksa",
    "Barpeta",
    "Biswanath",
    "Bongaigaon",
    "Cachar",
    "Charaideo",
    "Chirang",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Goalpara",
    "Golaghat",
    "Hailakandi",
    "Hojai",
    "Jorhat",
    "Kamrup Metropolitan",
    "Kamrup",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Majuli",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Dima Hasao",
    "Sivasagar",
    "Sonitpur",
    "South Salmara-Mankachar",
    "Tinsukia",
    "Udalguri",
  ],
  Bihar: [
    "Araria",
    "Arwal",
    "Aurangabad",
    "Banka",
    "Begusarai",
    "Bhagalpur",
    "Bhojpur",
    "Buxar",
    "Darbhanga",
    "East Champaran",
    "Gaya",
    "Gopalganj",
    "Jamui",
    "Jehanabad",
    "Kaimur",
    "Katihar",
    "Khagaria",
    "Kishanganj",
    "Lakhisarai",
    "Madhepura",
    "Madhubani",
    "Munger",
    "Muzaffarpur",
    "Nalanda",
    "Nawada",
    "Patna",
    "Purnia",
    "Rohtas",
    "Saharsa",
    "Samastipur",
    "Saran",
    "Sheikhpura",
    "Sheohar",
    "Sitamarhi",
    "Siwan",
    "Supaul",
    "Vaishali",
    "West Champaran",
  ],
  Chhattisgarh: [
    "Balod",
    "Baloda Bazar",
    "Balrampur",
    "Bastar",
    "Bemetara",
    "Bijapur",
    "Bilaspur",
    "Dantewada",
    "Dhamtari",
    "Durg",
    "Gariaband",
    "Janjgir-Champa",
    "Jashpur",
    "Kabirdham",
    "Kanker",
    "Kondagaon",
    "Korba",
    "Koriya",
    "Mahasamund",
    "Mungeli",
    "Narayanpur",
    "Raigarh",
    "Raipur",
    "Rajnandgaon",
    "Sukma",
    "Surajpur",
    "Surguja",
  ],
  Goa: ["North Goa", "South Goa"],
  Gujarat: [
    "Ahmedabad",
    "Amreli",
    "Anand",
    "Aravalli",
    "Banaskantha",
    "Bharuch",
    "Bhavnagar",
    "Botad",
    "Chhota Udaipur",
    "Dahod",
    "Dang",
    "Devbhoomi Dwarka",
    "Gandhinagar",
    "Gir Somnath",
    "Jamnagar",
    "Junagadh",
    "Kheda",
    "Kutch",
    "Mahisagar",
    "Mehsana",
    "Morbi",
    "Narmada",
    "Navsari",
    "Panchmahal",
    "Patan",
    "Porbandar",
    "Rajkot",
    "Sabarkantha",
    "Surat",
    "Surendranagar",
    "Tapi",
    "Vadodara",
    "Valsad",
  ],
  Haryana: [
    "Ambala",
    "Bhiwani",
    "Charkhi Dadri",
    "Faridabad",
    "Fatehabad",
    "Gurugram",
    "Hisar",
    "Jhajjar",
    "Jind",
    "Kaithal",
    "Karnal",
    "Kurukshetra",
    "Mahendragarh",
    "Nuh",
    "Palwal",
    "Panchkula",
    "Panipat",
    "Rewari",
    "Rohtak",
    "Sirsa",
    "Sonipat",
    "Yamunanagar",
  ],
  "Himachal Pradesh": [
    "Bilaspur",
    "Chamba",
    "Hamirpur",
    "Kangra",
    "Kinnaur",
    "Kullu",
    "Lahaul and Spiti",
    "Mandi",
    "Shimla",
    "Sirmaur",
    "Solan",
    "Una",
  ],
  Jharkhand: [
    "Bokaro",
    "Chatra",
    "Deoghar",
    "Dhanbad",
    "Dumka",
    "East Singhbhum",
    "Garhwa",
    "Giridih",
    "Godda",
    "Gumla",
    "Hazaribagh",
    "Jamtara",
    "Khunti",
    "Koderma",
    "Latehar",
    "Lohardaga",
    "Pakur",
    "Palamu",
    "Ramgarh",
    "Ranchi",
    "Sahibganj",
    "Seraikela Kharsawan",
    "Simdega",
    "West Singhbhum",
  ],
  Karnataka: [
    "Bagalkot",
    "Ballari",
    "Belagavi",
    "Bengaluru Rural",
    "Bengaluru Urban",
    "Bidar",
    "Chamarajanagar",
    "Chikballapur",
    "Chikkamagaluru",
    "Chitradurga",
    "Dakshina Kannada",
    "Davangere",
    "Dharwad",
    "Gadag",
    "Hassan",
    "Haveri",
    "Kalaburagi",
    "Kodagu",
    "Kolar",
    "Koppal",
    "Mandya",
    "Mysuru",
    "Raichur",
    "Ramanagara",
    "Shivamogga",
    "Tumakuru",
    "Udupi",
    "Uttara Kannada",
    "Vijayapura",
    "Yadgir",
  ],
  Kerala: [
    "Alappuzha",
    "Ernakulam",
    "Idukki",
    "Kannur",
    "Kasaragod",
    "Kollam",
    "Kottayam",
    "Kozhikode",
    "Malappuram",
    "Palakkad",
    "Pathanamthitta",
    "Thiruvananthapuram",
    "Thrissur",
    "Wayanad",
  ],
  "Madhya Pradesh": [
    "Agar Malwa",
    "Alirajpur",
    "Anuppur",
    "Ashoknagar",
    "Balaghat",
    "Barwani",
    "Betul",
    "Bhind",
    "Bhopal",
    "Burhanpur",
    "Chhatarpur",
    "Chhindwara",
    "Damoh",
    "Datia",
    "Dewas",
    "Dhar",
    "Dindori",
    "Guna",
    "Gwalior",
    "Harda",
    "Hoshangabad",
    "Indore",
    "Jabalpur",
    "Jhabua",
    "Katni",
    "Khandwa",
    "Khargone",
    "Mandla",
    "Mandsaur",
    "Morena",
    "Narsinghpur",
    "Neemuch",
    "Panna",
    "Raisen",
    "Rajgarh",
    "Ratlam",
    "Rewa",
    "Sagar",
    "Satna",
    "Sehore",
    "Seoni",
    "Shahdol",
    "Shajapur",
    "Sheopur",
    "Shivpuri",
    "Sidhi",
    "Singrauli",
    "Tikamgarh",
    "Ujjain",
    "Umaria",
    "Vidisha",
  ],
  Maharashtra: [
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Aurangabad",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Osmanabad",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ],
  Manipur: [
    "Bishnupur",
    "Chandel",
    "Churachandpur",
    "Imphal East",
    "Imphal West",
    "Jiribam",
    "Kakching",
    "Kamjong",
    "Kangpokpi",
    "Noney",
    "Pherzawl",
    "Senapati",
    "Tamenglong",
    "Tengnoupal",
    "Thoubal",
    "Ukhrul",
  ],
  Meghalaya: [
    "East Garo Hills",
    "East Jaintia Hills",
    "East Khasi Hills",
    "North Garo Hills",
    "Ri Bhoi",
    "South Garo Hills",
    "South West Garo Hills",
    "South West Khasi Hills",
    "West Garo Hills",
    "West Jaintia Hills",
    "West Khasi Hills",
  ],
  Mizoram: [
    "Aizawl",
    "Champhai",
    "Kolasib",
    "Lawngtlai",
    "Lunglei",
    "Mamit",
    "Saiha",
    "Serchhip",
  ],
  Nagaland: [
    "Dimapur",
    "Kiphire",
    "Kohima",
    "Longleng",
    "Mokokchung",
    "Mon",
    "Peren",
    "Phek",
    "Tuensang",
    "Wokha",
    "Zunheboto",
  ],
  Odisha: [
    "Angul",
    "Balangir",
    "Balasore",
    "Bargarh",
    "Bhadrak",
    "Boudh",
    "Cuttack",
    "Deogarh",
    "Dhenkanal",
    "Gajapati",
    "Ganjam",
    "Jagatsinghpur",
    "Jajpur",
    "Jharsuguda",
    "Kalahandi",
    "Kandhamal",
    "Kendrapara",
    "Kendujhar",
    "Khordha",
    "Koraput",
    "Malkangiri",
    "Mayurbhanj",
    "Nabarangpur",
    "Nayagarh",
    "Nuapada",
    "Puri",
    "Rayagada",
    "Sambalpur",
    "Sonepur",
    "Sundargarh",
  ],
  Punjab: [
    "Amritsar",
    "Barnala",
    "Bathinda",
    "Faridkot",
    "Fatehgarh Sahib",
    "Fazilka",
    "Ferozepur",
    "Gurdaspur",
    "Hoshiarpur",
    "Jalandhar",
    "Kapurthala",
    "Ludhiana",
    "Mansa",
    "Moga",
    "Muktsar",
    "Nawanshahr",
    "Pathankot",
    "Patiala",
    "Rupnagar",
    "Sahibzada Ajit Singh Nagar",
    "Sangrur",
    "Sri Muktsar Sahib",
    "Tarn Taran",
  ],
  Rajasthan: [
    "Ajmer",
    "Alwar",
    "Banswara",
    "Baran",
    "Barmer",
    "Bharatpur",
    "Bhilwara",
    "Bikaner",
    "Bundi",
    "Chittorgarh",
    "Churu",
    "Dausa",
    "Dholpur",
    "Dungarpur",
    "Hanumangarh",
    "Jaipur",
    "Jaisalmer",
    "Jalore",
    "Jhalawar",
    "Jhunjhunu",
    "Jodhpur",
    "Karauli",
    "Kota",
    "Nagaur",
    "Pali",
    "Pratapgarh",
    "Rajsamand",
    "Sawai Madhopur",
    "Sikar",
    "Sirohi",
    "Sri Ganganagar",
    "Tonk",
    "Udaipur",
  ],
  Sikkim: ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": [
    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kancheepuram",
    "Kanyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar",
  ],
  Telangana: [
    "Adilabad",
    "Bhadradri Kothagudem",
    "Hyderabad",
    "Jagtial",
    "Jangaon",
    "Jayashankar Bhupalpally",
    "Jogulamba Gadwal",
    "Kamareddy",
    "Karimnagar",
    "Khammam",
    "Kumuram Bheem Asifabad",
    "Mahabubabad",
    "Mahabubnagar",
    "Mancherial",
    "Medak",
    "Medchal–Malkajgiri",
    "Mulugu",
    "Nagarkurnool",
    "Nalgonda",
    "Narayanpet",
    "Nirmal",
    "Nizamabad",
    "Peddapalli",
    "Rajanna Sircilla",
    "Rangareddy",
    "Sangareddy",
    "Siddipet",
    "Suryapet",
    "Vikarabad",
    "Wanaparthy",
    "Warangal Rural",
    "Warangal Urban",
    "Yadadri Bhuvanagiri",
  ],
  Tripura: [
    "Dhalai",
    "Gomati",
    "Khowai",
    "North Tripura",
    "Sepahijala",
    "South Tripura",
    "Unakoti",
    "West Tripura",
  ],
  "Uttar Pradesh": [
    "Agra",
    "Aligarh",
    "Allahabad",
    "Ambedkar Nagar",
    "Amethi",
    "Amroha",
    "Auraiya",
    "Azamgarh",
    "Baghpat",
    "Bahraich",
    "Ballia",
    "Balrampur",
    "Banda",
    "Barabanki",
    "Bareilly",
    "Basti",
    "Bhadohi",
    "Bijnor",
    "Budaun",
    "Bulandshahr",
    "Chandauli",
    "Chitrakoot",
    "Deoria",
    "Etah",
    "Etawah",
    "Faizabad",
    "Farrukhabad",
    "Fatehpur",
    "Firozabad",
    "Gautam Buddha Nagar",
    "Ghaziabad",
    "Ghazipur",
    "Gonda",
    "Gorakhpur",
    "Hamirpur",
    "Hapur",
    "Hardoi",
    "Hathras",
    "Jalaun",
    "Jaunpur",
    "Jhansi",
    "Kannauj",
    "Kanpur Dehat",
    "Kanpur Nagar",
    "Kasganj",
    "Kaushambi",
    "Kushinagar",
    "Lakhimpur Kheri",
    "Lalitpur",
    "Lucknow",
    "Maharajganj",
    "Mahoba",
    "Mainpuri",
    "Mathura",
    "Mau",
    "Meerut",
    "Mirzapur",
    "Moradabad",
    "Muzaffarnagar",
    "Pilibhit",
    "Pratapgarh",
    "Prayagraj",
    "Raebareli",
    "Rampur",
    "Saharanpur",
    "Sambhal",
    "Sant Kabir Nagar",
    "Shahjahanpur",
    "Shamli",
    "Shravasti",
    "Siddharthnagar",
    "Sitapur",
    "Sonbhadra",
    "Sultanpur",
    "Unnao",
    "Varanasi",
  ],
  Uttarakhand: [
    "Almora",
    "Bageshwar",
    "Chamoli",
    "Champawat",
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Pauri Garhwal",
    "Pithoragarh",
    "Rudraprayag",
    "Tehri Garhwal",
    "Udham Singh Nagar",
    "Uttarkashi",
  ],
  "West Bengal": [
    "Alipurduar",
    "Bankura",
    "Birbhum",
    "Cooch Behar",
    "Dakshin Dinajpur",
    "Darjeeling",
    "Hooghly",
    "Howrah",
    "Jalpaiguri",
    "Jhargram",
    "Kalimpong",
    "Kolkata",
    "Malda",
    "Murshidabad",
    "Nadia",
    "North 24 Parganas",
    "Paschim Bardhaman",
    "Paschim Medinipur",
    "Purba Bardhaman",
    "Purba Medinipur",
    "Purulia",
    "South 24 Parganas",
    "Uttar Dinajpur",
  ],
  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  "Jammu and Kashmir": [
    "Anantnag",
    "Bandipora",
    "Baramulla",
    "Budgam",
    "Doda",
    "Ganderbal",
    "Jammu",
    "Kathua",
    "Kishtwar",
    "Kulgam",
    "Kupwara",
    "Pulwama",
    "Punch",
    "Rajouri",
    "Ramban",
    "Reasi",
    "Samba",
    "Shopian",
    "Srinagar",
    "Udhampur",
  ],
  Ladakh: ["Kargil", "Leh"],
};

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [clickedField, setClickedField] = useState("");
  const { language, toggleLanguage } = useLanguage();

  const handleFieldClick = (fieldName) => {
    setClickedField(fieldName);
    setTimeout(() => setClickedField(""), 5000);
  };

  const WarningMessage = () => (
    <div style={{
      width: "80%",
      backgroundColor: "#fff3cd",
      color: "#856404",
      padding: "8px 12px",
      borderRadius: "5px",
      border: "1px solid #ffc107",
      marginTop: "5px",
      marginBottom: "5px",
      marginLeft: "auto",
      marginRight: "auto",
      fontWeight: "500",
      fontSize: "14px"
    }}>
      ⚠️ {t("You want to change it? Send email with information", language)}
    </div>
  );

  useEffect(() => {
    loadFormData().then(localData => {
      // Normalize loaded data (State and Country usually work fine, but ensuring)
      if (localData.country) localData.country = normalizeDropdownValue("country", localData.country);
      if (localData.state) localData.state = normalizeDropdownValue("state", localData.state);
      if (localData.district) localData.district = normalizeDropdownValue("district", localData.district);
      
      setForm(localData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      saveFormData(form);
    }
  }, [form, loading]);

  useEffect(() => {
    // Load existing photos from form data and sync all related state
    let photosToLoad = [];
    
    if (form.photos && Array.isArray(form.photos) && form.photos.length > 0) {
      photosToLoad = form.photos;
    } else if (form.photo) {
      // Try to parse if it's a JSON string array (new format storage)
      if (typeof form.photo === "string" && (form.photo.startsWith("[") || form.photo.startsWith("%5B"))) { // subtle check for encoded or normal array
         try {
           const parsed = JSON.parse(decodeURIComponent(form.photo)); // Decode just in case, though usually not needed for raw DB strings
           if (Array.isArray(parsed)) {
             photosToLoad = parsed;
             // Update form to use photos array properties for future consistency
             setForm(prev => ({ ...prev, photos: parsed, photo: null })); // Clear raw string to avoid confusion? Or keep it? keeping photos is enough.
           } else {
             photosToLoad = [form.photo];
           }
         } catch (e) {
           // Not a JSON array, legitimate single string path (legacy)
           photosToLoad = [form.photo];
         }
      } else {
         // Single file object or simple string path
         photosToLoad = [form.photo];
      }
    }

    if (photosToLoad.length > 0) {
      const urls = photosToLoad.map(photo => {
        if (typeof photo === "string") {
           // If it's a string path from database, convert to full URL
           // Clean the path first - remove [" and "] if they somehow persisted in a weird way, though JSON parse should handle it.
           // Actually, if we are here, 'photo' is a single path string (e.g. "uploads/abc.jpg")
           
           // Check against "null" string just in case
           if (photo === "null" || !photo) return null;

           return photo.startsWith("http") 
             ? photo 
             : `${API_URL}/${photo.replace(/\\/g, "/")}`;
        } else if (typeof window !== "undefined" && photo instanceof File) {
          return URL.createObjectURL(photo);
        }
        return null;
      }).filter(url => url !== null);
      
      setImageUrls(urls);
      setPhotoFiles(photosToLoad);
      
      // Calculate total size - fetch sizes for database photos
      const calculateTotalSize = async () => {
        let totalCalculatedSize = 0;
        
        for (let i = 0; i < photosToLoad.length; i++) {
          const photo = photosToLoad[i];
          
          if (photo instanceof File) {
            // For File objects, use the size property
            totalCalculatedSize += photo.size;
          } else if (typeof photo === "string" && photo !== "null" && photo) {
            // For database photos (string paths), fetch the file size
            try {
              const photoUrl = photo.startsWith("http") 
                ? photo 
                : `${API_URL}/${photo.replace(/\\/g, "/")}`;
              
              const response = await fetch(photoUrl, { method: 'HEAD' });
              const contentLength = response.headers.get('Content-Length');
              
              if (contentLength) {
                totalCalculatedSize += parseInt(contentLength, 10);
              }
            } catch (error) {
              console.error(`Error fetching size for photo ${photo}:`, error);
              // If we can't fetch the size, continue without it
            }
          }
        }
        
        setTotalSize(totalCalculatedSize);
      };
      
      calculateTotalSize();
    } else {
       setImageUrls([]);
       setPhotoFiles([]);
       setTotalSize(0);
    }
  }, [form.photos, form.photo]);

  const handleStateChange = (e) => {
    setForm({ ...form, state: e.target.value, district: "" });
  };

  const handleDistrictChange = (e) => {
    setForm({ ...form, district: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate photo count
    const currentPhotos = photoFiles.length;
    const newTotalCount = currentPhotos + files.length;
    
    if (newTotalCount > 2) {
      setPhotoError(`Maximum 2 photos allowed. You can add ${2 - currentPhotos} more photo(s).`);
      setTimeout(() => setPhotoError(""), 4000);
      e.target.value = "";
      return;
    }

    // Validate each file is an image
    const invalidFiles = files.filter(file => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setPhotoError("Please select only image files.");
      setTimeout(() => setPhotoError(""), 4000);
      e.target.value = "";
      return;
    }

    // Calculate total size
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0);
    const newTotalSize = totalSize + newFilesSize;
    
    if (newTotalSize > 10 * 1024 * 1024) {
      const remainingMB = ((10 * 1024 * 1024 - totalSize) / (1024 * 1024)).toFixed(2);
      setPhotoError(`Total file size exceeds 10MB limit. You have ${remainingMB}MB remaining.`);
      setTimeout(() => setPhotoError(""), 4000);
      e.target.value = "";
      return;
    }

    setPhotoError("");

    // Add new photos - only update form.photos, let useEffect handle the rest
    // Note: We need to handle the case where form.photos doesn't exist yet
    const currentFormPhotos = form.photos || [];
    const updatedPhotos = [...currentFormPhotos, ...files];
    setForm((p) => ({ ...p, photos: updatedPhotos, photo: null })); // Clear legacy 'photo' field if any
    
    e.target.value = ""; // Clear input to allow re-selecting
  };

  const removePhoto = (index) => {
    const updatedPhotos = photoFiles.filter((_, i) => i !== index);
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    
    // Revoke object URL if it's a blob
    if (imageUrls[index] && imageUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    
    // Recalculate total size
    const newTotalSize = updatedPhotos.reduce((sum, photo) => {
      if (photo instanceof File) {
        return sum + photo.size;
      }
      return sum;
    }, 0);
    
    // Update local state immediately to avoid flickers, but useEffect will also sync
    setPhotoFiles(updatedPhotos);
    setImageUrls(updatedUrls);
    setTotalSize(newTotalSize);
    setForm((p) => ({ ...p, photos: updatedPhotos }));
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .form-container {
            flex-direction: column !important;
            gap: 5px !important;
          }
          
          .left-column, .right-column {
            min-width: 100% !important;
            margin: 0 !important;
          }
          
          .button-container {
            flex-direction: column !important;
            gap: 10px !important;
            margin-top: 20px !important;
          }
          
          .button-container button {
            width: 90% !important;
            margin: 10px auto !important;
            max-width: 400px;
          }
          
          .field-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: 5px !important;
          }
          .field-label {
            text-align: left !important;
            min-width: 300px !important;
            max-width: 300px !important;
            width: 300px !important;
            margin: 0 auto !important;
          }
          .field-input {
            max-width:300px !important;
            width: 300px !important;
            margin: 5px auto !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
      <div style={styles.container}>
      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          </div>
      )}

      <h1 style={{ fontWeight: 'bold' }}>{t("Edit Details", language)}</h1>
      <br/>
      <Navigation current={6} />
      <h2>{t("Step 6 - Contact Details", language)}</h2>
      <br/>
      <div style={styles.formContainer} className="form-container">
        <div style={styles.leftColumn} className="left-column">
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Full Street Address", language)}:</label>
            <TamilInput
              style={styles.fieldInput}
              className="field-input"
              name="fullStreetAddress"
              value={form.fullStreetAddress ?? ""}
              onChange={(e) =>
                setForm({ ...form, fullStreetAddress: e.target.value })
              }
              placeholder={t("Full Street Address", language)}
              forcedLanguage={language}
            />
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("City", language)}:</label>
            <TamilInput
              style={styles.fieldInput}
              className="field-input"
              name="city"
              value={form.city ?? ""}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder={t("Full City Name", language)}
              forcedLanguage={language}
            />
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("State", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              value={form.state ?? ""}
              onChange={handleStateChange}
            >
              <option value="">{t("Select State", language)}</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {t(state, language)}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("District", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              value={form.district ?? ""}
              onChange={handleDistrictChange}
              disabled={!form.state}
            >
              <option value="">{t("Select District", language)}</option>
              {form.state &&
                districtsByState[form.state]?.map((district) => (
                  <option key={district} value={district}>
                    {t(district, language)}
                  </option>
                ))}
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Country", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              value={form.country ?? ""}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            >
              <option value="">{t("Select Country", language)}</option>
              <option value="Afghanistan">{t("Afghanistan", language)}</option>
              <option value="Australia">{t("Australia", language)}</option>
              <option value="Bangladesh">{t("Bangladesh", language)}</option>
              <option value="Bhutan">{t("Bhutan", language)}</option>
              <option value="Brazil">{t("Brazil", language)}</option>
              <option value="Canada">{t("Canada", language)}</option>
              <option value="China">{t("China", language)}</option>
              <option value="France">{t("France", language)}</option>
              <option value="Germany">{t("Germany", language)}</option>
              <option value="India">{t("India", language)}</option>
              <option value="Indonesia">{t("Indonesia", language)}</option>
              <option value="Italy">{t("Italy", language)}</option>
              <option value="Japan">{t("Japan", language)}</option>
              <option value="Kuwait">{t("Kuwait", language)}</option>
              <option value="Malaysia">{t("Malaysia", language)}</option>
              <option value="Maldives">{t("Maldives", language)}</option>
              <option value="Myanmar (Burma)">{t("Myanmar (Burma)", language)}</option>
              <option value="Nepal">{t("Nepal", language)}</option>
              <option value="Netherlands">{t("Netherlands", language)}</option>
              <option value="New Zealand">{t("New Zealand", language)}</option>
              <option value="Pakistan">{t("Pakistan", language)}</option>
              <option value="Qatar">{t("Qatar", language)}</option>
              <option value="Russia">{t("Russia", language)}</option>
              <option value="Saudi Arabia">{t("Saudi Arabia", language)}</option>
              <option value="Singapore">{t("Singapore", language)}</option>
              <option value="South Africa">{t("South Africa", language)}</option>
              <option value="South Korea">{t("South Korea", language)}</option>
              <option value="Spain">{t("Spain", language)}</option>
              <option value="Sri Lanka">{t("Sri Lanka", language)}</option>
              <option value="Switzerland">{t("Switzerland", language)}</option>
              <option value="Thailand">{t("Thailand", language)}</option>
              <option value="United Arab Emirates">{t("United Arab Emirates", language)}</option>
              <option value="United Kingdom">{t("United Kingdom", language)}</option>
              <option value="United States of America">{t("United States of America", language)}</option>
              <option value="Vietnam">{t("Vietnam", language)}</option>
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Postal Code", language)}:</label>
            <input
              style={styles.fieldInput}
              className="field-input"
              value={form.postalCode ?? ""}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              placeholder={t("Postal Code", language)}
              maxLength={6}
            />
          </div>
        </div>
        <div style={styles.rightColumn} className="right-column">
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Phone Number", language)}:</label>
            <input
              style={{...styles.fieldInput, cursor: "pointer"}}
              className="field-input"
              value={form.phone ?? ""}
              readOnly
              onClick={() => handleFieldClick("phone")}
              title={t("You want to change it? Send email with information", language)}
            />
          </div>
          {clickedField === "phone" && <WarningMessage />}
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Other Phone Number", language)}:</label>
            <input
              style={styles.fieldInput}
              className="field-input"
              value={form.otherPhone ?? ""}
              onChange={(e) => setForm({ ...form, otherPhone: e.target.value })}
              placeholder={t("Other Phone Number", language)}
            />
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("WhatsApp No.", language)}:</label>
            <input
              style={{...styles.fieldInput, cursor: "pointer"}}
              className="field-input"
              value={form.whatsAppNo ?? ""}
              readOnly
              onClick={() => handleFieldClick("whatsapp")}
              title={t("You want to change it? Send email with information", language)}
            />
          </div>
          {clickedField === "whatsapp" && <WarningMessage />}
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Email", language)}:</label>
            <input
              style={{...styles.fieldInput, cursor: "pointer"}}
              className="field-input"
              value={form.email ?? ""}
              readOnly
              onClick={() => handleFieldClick("email")}
              title={t("You want to change it? Send email with information", language)}
            />
          </div>
          {clickedField === "email" && <WarningMessage />}
          
          <label style={{ marginLeft: "30px", display: "block", marginBottom: "5px" }}>
             {t("Upload Photos (Max 2, Total 10MB)", language)}
          </label>
          <div style={{ marginLeft: "30px", marginBottom: "10px", color: "#666" }}>
            <small>
              <strong>{photoFiles.length} /{t("2 photos", language)}</strong> | 
              {totalSize > 0 ? (
                <strong>{t("already used", language)} {(totalSize / (1024 * 1024)).toFixed(2)} MB / 10 MB</strong>
              ) : (
                <strong style={{ color: "#28a745" }}>{t("available", language)} 10.00 MB / 10 MB</strong>
              )}
            </small>
          </div>
          
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Select Photos", language)}:</label>
            <input
              style={{...styles.fieldInput, flex: 'initial', width: '200px'}}
              className="field-input"
              type="file"
              name="photos"
              onChange={handleFileChange}
              accept="image/*"
              multiple
            />
          </div>
          {photoError && <p style={{ color: "red", textAlign: "center", marginTop: "-10px", marginBottom: "10px" }}>{photoError}</p>}
          
          <div
            style={{
              margin: "20px 30px",
              minHeight: "50px",
            }}
          >
            {imageUrls.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "10px",
                }}
              >
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "1px solid var(--input-border)",
                      aspectRatio: "1/1"
                    }}
                  >
                    <img
                      loading="lazy"
                      src={url}
                      alt={`Photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "rgba(255, 0, 0, 0.8)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "25px",
                        height: "25px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#999",
                  border: "2px dashed var(--input-border)",
                  borderRadius: "6px",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  fontSize: "14px"
                }}
              >
                📷 {t("No photos uploaded yet. Select photos above.", language)}
              </div>
            )}
          </div>

        </div>
      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.editDetailPreviousButton}
            onClick={async () => {
              await saveFormData(form); // Save before navigating
              router.push("/editdetail/5");
            }}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div style={styles.rightColumn}>
          <button
            style={styles.editDetailButton}
            onClick={async () => {
              if (!form.photos || form.photos.length === 0) {
                  setPhotoError(t("At least one photo is required", language));
                  setTimeout(() => setPhotoError(""), 4000);
                  return;
              }
              await saveFormData(form); // Save before navigating
              router.push("/editdetail/7");
            }}
          >
            {t("Next", language)}
          </button>
        </div>
      </div>
    </div>

      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
        {t("Go To Dashboard", language)} <span style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/dashboard")}>{t("ClickHere", language)}</span>
      </div>
    </div>
    </>
  );
}
