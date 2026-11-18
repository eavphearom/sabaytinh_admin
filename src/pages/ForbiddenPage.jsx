import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return <main role="alert" className="p-8">
    <h1>Access denied</h1>
    <p>Your account does not have permission to access this resource.</p>
    <Link to="/">Back to dashboard</Link>
  </main>;
}
