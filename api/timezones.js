// API handler for timezones
export default function handler(req, res) {
  // Define a list of available timezones
  const timezones = [
    { value: "Asia/Kolkata", label: "New Delhi (IST)", offset: "+5:30" },
    { value: "America/New_York", label: "New York (EDT/EST)", offset: "-4:00" },
    { value: "EST", label: "Eastern Standard Time (EST)", offset: "-5:00" },
    { value: "EDT", label: "Eastern Daylight Time (EDT)", offset: "-4:00" },
    { value: "Europe/London", label: "London (BST/GMT)", offset: "+1:00" },
    { value: "Europe/Paris", label: "Paris (CEST/CET)", offset: "+2:00" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "+9:00" },
    { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)", offset: "+10:00" },
    { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)", offset: "+12:00" },
    { value: "America/Los_Angeles", label: "Los Angeles (PDT/PST)", offset: "-7:00" },
    { value: "Asia/Dubai", label: "Dubai (GST)", offset: "+4:00" },
    { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "+8:00" }
  ];
  
  res.status(200).json(timezones);
}