// src/pages/therapist/therapistComponent/SpecificationList.tsx
import { useEffect, useState } from "react";
import { Spin } from "antd";
import axios from "axios";
import AuthService from "../../service/AuthService";

interface Specification {
  specificationId: string;
  name: string;
  description: string;
  level: number; // Added level field
}

interface SpecificationListProps {
  therapistId: string;
  showNotification: (type: "success" | "error", message: string, description: string) => void;
}

const SpecificationList = ({ therapistId, showNotification }: SpecificationListProps) => {
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpecifications = async () => {
    if (!therapistId) {
      showNotification("error", "Error", "Therapist ID not found");
      setLoading(false);
      return;
    }

    try {
      const token = AuthService.getToken();
      const { data } = await axios.get<Specification[]>(
        `https://premaritalcounselingplatform-dhetaherhybqe8bg.southeastasia-01.azurewebsites.net/api/Specification/Get_Specification_By_Therapist_Id?id=${therapistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSpecifications(data);
    } catch (error) {
      console.error("Error fetching specifications:", error);
      showNotification("error", "Error", "Unable to load specifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecifications();
  }, [therapistId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Specializations</h2>
      {specifications.length === 0 ? (
        <p className="text-gray-500">No specializations found.</p>
      ) : (
        <ul className="space-y-4">
          {specifications.map((spec) => (
            <li key={spec.specificationId} className="border-b pb-2">
              <h3 className="text-md font-medium text-gray-700">{spec.name}</h3>
              <p className="text-sm text-gray-500">{spec.description}</p>
              <p className="text-sm text-gray-600">Level: {spec.level}</p> {/* Display the level */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SpecificationList;