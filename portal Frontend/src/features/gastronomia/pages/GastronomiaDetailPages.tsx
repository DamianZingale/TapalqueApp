import { useParams } from "react-router-dom";
import { Info, InfoTest } from "../components/Info";


export default function GastronomiaDetailPage() {
  const { id = "1" } = useParams();

  return (
    <div className="container my-4">
      <InfoTest/>
    </div>
  );
}
