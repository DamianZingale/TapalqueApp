import { useParams } from "react-router-dom";
import { InfoTest, mockData } from "../types/InfoTest";
import { WhatsAppButton } from "../../../shared/components/WhatsAppButton";

//import { Info } from "../components/Info";


export default function GastronomiaDetailPage() {
  //const { id = "1" } = useParams();

  return (
    <div className="container my-4">
      <InfoTest/>
     <WhatsAppButton num = {mockData.phone ?? ""} />
    </div>
  );
}
