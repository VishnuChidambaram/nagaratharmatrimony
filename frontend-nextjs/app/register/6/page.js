"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../styles";
import Navigation from "../components/Navigation";
import TamilInput from "@/app/components/TamilInput";
import TamilPopup from "@/app/components/TamilPopup";
import LanguageToggle from "@/app/components/LanguageToggle";
import { t } from "@/app/utils/translations";
import { useLanguage } from "../../hooks/useLanguage";
import { API_URL } from "@/app/utils/config";


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
    "Poonch",
    "Pulwama",
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

export default function Step6() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  const [isLoaded, setIsLoaded] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  
  // Load form data on client side only to prevent hydration errors
  // Load form data on client side only to prevent hydration errors
  useEffect(() => {
    loadFormData().then(data => {
      setForm(data);
      setIsLoaded(true);
    });
  }, []);
  
  useEffect(() => {
    if (isLoaded) {
      if (!form.phone) {
         // Default phone not set
      }
      saveFormData(form);
    }
  }, [form, isLoaded]);

  useEffect(() => {
    // Load existing photos from form data and sync all related state
    let photosToLoad = [];
    
    if (form.photos && Array.isArray(form.photos) && form.photos.length > 0) {
      photosToLoad = form.photos;
    } else if (form.photo) {
      // Try to parse if it's a JSON string array (new format storage)
      if (typeof form.photo === "string" && (form.photo.startsWith("[") || form.photo.startsWith("%5B"))) {
         try {
           const parsed = JSON.parse(decodeURIComponent(form.photo));
           if (Array.isArray(parsed)) {
             photosToLoad = parsed;
             // Update form to use photos array properties for future consistency
             setForm(prev => ({ ...prev, photos: parsed, photo: null })); 
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
  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate photo count
    const currentPhotos = photoFiles.length;
    const newTotalCount = currentPhotos + files.length;
    
    if (newTotalCount > 2) {
      setError(`Maximum 2 photos allowed. You can add ${2 - currentPhotos} more photo(s).`);
      setTimeout(() => setError(""), 4000);
      e.target.value = "";
      return;
    }

    // Validate each file is an image
    const invalidFiles = files.filter(file => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setError("Please select only image files.");
      setTimeout(() => setError(""), 4000);
      e.target.value = "";
      return;
    }

    // Calculate total size
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0);
    const newTotalSize = totalSize + newFilesSize;
    
    if (newTotalSize > 10 * 1024 * 1024) {
      const remainingMB = ((10 * 1024 * 1024 - totalSize) / (1024 * 1024)).toFixed(2);
      setError(`Total file size exceeds 10MB limit. You have ${remainingMB}MB remaining.`);
      setTimeout(() => setError(""), 4000);
      e.target.value = "";
      return;
    }

    // Add new photos - only update form.photos, let useEffect handle the rest
    const updatedPhotos = [...photoFiles, ...files];
    setForm((p) => ({ ...p, photos: updatedPhotos, photo: null }));
    
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
    
    setPhotoFiles(updatedPhotos);
    setImageUrls(updatedUrls);
    setTotalSize(newTotalSize);
    setForm((p) => ({ ...p, photos: updatedPhotos }));
  };
  const validate = () => {
    if (!form.fullStreetAddress.trim())
      return "Full Street Address is required OR Enter NA for unknown fields";
    if (!form.city.trim()) return "City is required OR Enter NA for unknown fields";
    if (!form.state.trim()) return "State is required OR Enter NA for unknown fields";
    if (!form.district.trim()) return "District is required OR Enter NA for unknown fields";
    if (!form.country.trim()) return "Country is required OR Enter NA for unknown fields";
    // Additional validation for state and district
    if (form.state && form.state !== "NA" && !indianStates.includes(form.state)) {
      return "Invalid state selected/select states in india";
    }
    if (
      form.district &&
      form.state &&
      form.state !== "NA" &&
      form.district !== "NA" &&
      (!districtsByState[form.state] ||
        !districtsByState[form.state].includes(form.district))
    ) {
      return "Invalid district selected for the chosen state";
    }
    if (!form.postalCode.trim()) return "Postal Code is required OR Enter NA for unknown fields";
    if (form.postalCode.trim() !== "NA" && !/^\d{6}$/.test(form.postalCode.trim()))
      return "Postal Code must be exactly 6 digits";
    if (!form.phone.trim()) return "Phone is required OR Enter 0 for unknown fields";
    if (form.phone.trim() !== "0" && (!form.phone.startsWith("+91") || form.phone.length !== 13))
      return "Phone must start with +91 and be followed by 10 digits";
    if (form.otherPhone && form.otherPhone.trim() !== "0" && !form.otherPhone.trim().startsWith("+"))
       return "Other country phone must start with + (country code)";
    if (!form.whatsAppNo.trim()) return "WhatsApp No. is required OR Enter 0 for unknown fields";
    if (form.whatsAppNo.trim() !== "0" && !/^[6-9]\d{9}$/.test(form.whatsAppNo.trim()))
      return "WhatsApp No. must be 10 digits starting with 6,7,8, or 9";
    if (!form.email.trim()) return "E-mail is required OR Enter NA for unknown fields";
    else if (form.email.trim() !== "NA" && !/\S+@\S+\.\S+/.test(form.email)) return "E-mail is invalid";
    else if (form.email.trim() !== "NA" && !form.email.trim().toLowerCase().endsWith("@gmail.com")) 
      return "E-mail must end with @gmail.com";
    if (!form.photos || form.photos.length === 0) return "At least one photo is required";
    if (form.photos.length > 2) return "Maximum 2 photos allowed";
    
    // Check total size
    const totalSize = form.photos.reduce((acc, file) => acc + (file.size || 0), 0);
    if (totalSize > 10 * 1024 * 1024) return "Total size exceeds 10MB";
    
    return "";
  };
  const next = () => {
    const v = validate();
    if (v) {
      setError(v);
      setTimeout(() => setError(""), 4000);
      return;
    }
    router.push("/register/7");
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
            max-width: 95% !important;
          }
          .form-row {
            flex-direction: column !important;
          }
          .button-container {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .button-container button {
            width: 90% !important;
            margin: 10px auto !important;
            max-width: 400px;
          }
        }
        @media (max-width: 480px) {
          h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
      <div style={styles.container}>
      <h1 style={{ fontWeight: 'bold' }}>{t("Register Form", language)}</h1>
      <br/>
      <Navigation current={6} />
      <h1>{t("Step 6 - Contact Details", language)}</h1>
      
      <LanguageToggle language={language} toggleLanguage={toggleLanguage} />

      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          <TamilPopup onClose={() => {}} duration={3000} position="relative" />
        </div>
      )}

      <br/>
      <div style={styles.formContainer} className="form-container">
        <div style={styles.leftColumn} className="left-column">
          <TamilInput
            name="fullStreetAddress"
            value={form.fullStreetAddress}
            onChange={handle}
            placeholder={t("Full Street Address", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
            style={styles.input}
          />
          <TamilInput
            name="city"
            value={form.city}
            onChange={handle}
            placeholder={t("City", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
            style={styles.input}
          />
          <select
            style={styles.input}
            name="state"
            value={form.state}
            onChange={handle}
          >
            <option value="">{t("Select State", language)}</option>
            {indianStates.map((s) => (
              <option key={s} value={s}>
                {t(s, language)}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            name="district"
            value={form.district}
            onChange={handle}
          >
            <option value="">{t("Select District", language)}</option>
            {form.state && districtsByState[form.state]
              ? districtsByState[form.state].map((d) => (
                  <option key={d} value={d}>
                    {t(d, language)}
                  </option>
                ))
              : null}
          </select>
          <select
            style={styles.input}
            name="country"
            value={form.country}
            onChange={handle}
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
          <TamilInput
            name="postalCode"
            value={form.postalCode}
            onChange={handle}
            placeholder={t("Postal Code", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
            style={styles.input}
          />
        </div>
        <div style={styles.rightColumn} className="right-column">
          <TamilInput
            name="phone"
            value={form.phone}
            onChange={handle}
            placeholder={t("Phone Number (+91...)", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
            style={styles.input}
          />
          <TamilInput
            style={styles.input}
            name="otherPhone"
            value={form.otherPhone}
            onChange={handle}
            placeholder={t("Other Phone Number", language) + " (+Code...)"}
            forcedLanguage={language === "ta" ? "ta" : "en"}
           
          />
          <TamilInput
            style={styles.input}
            name="whatsAppNo"
            value={form.whatsAppNo}
            onChange={handle}
            placeholder={t("WhatsApp No.", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
           
          />
          <TamilInput
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handle}
            placeholder={t("Email", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
            helperMessage={t("Type in English only", language)}
          />
          <label style={{ marginLeft: "20px" }}>
            <br></br>
            {t("Upload Photos", language)} ({t("(Max 2 photos)", language)}) &nbsp;
          </label>
          <br></br>
          <div style={{ marginLeft: "20px", marginBottom: "10px", color: "#666" }}>
            <small>
              <strong>{photoFiles.length} of 2 photos</strong> | 
              <strong> {(totalSize / (1024 * 1024)).toFixed(2)} MB / 10 MB</strong>
            </small>
          </div>
          <input
            type="file"
            style={styles.input}
            name="photos"
            onChange={handleFileChange}
            accept="image/*"
            multiple
          />
           <label style={{ marginLeft: "20px" }}>
            <br></br>
             Carefully it is Your Life Turning Point
          </label>
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "15px",
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
                    }}
                  >
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "150px",
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
                }}
              >
                📷 No photos uploaded yet. Select photos above to get started.
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.previousButton1}
            onClick={() => router.push("/register/5")}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div style={styles.rightColumn}>
          <button style={styles.button1} onClick={next}>
            {t("Next", language)}
          </button>
        </div>
      </div>

      <p style={{ textAlign: "center", marginTop: "10px" }}>
        {t("Already have an account?", language)}{" "}
        <a
          href="/login"
          style={{
            color: "blue",
            textDecoration: "underline",
            fontSize: "16px",
          }}
        >
          {t("Login", language)}
        </a>
      </p>
    </div>
    </>
  );
}