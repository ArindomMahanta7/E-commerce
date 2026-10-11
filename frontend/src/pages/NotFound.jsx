import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import useDocumentTitle from "../hooks/useDocumentTitle";
import EmptyState from "../components/common/EmptyState";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <EmptyState
      icon={Compass}
      title="404 - Page not found"
      message="The page you are looking for does not exist or may have been moved."
      action={
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      }
    />
  );
}
