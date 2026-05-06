import { useParams, Link } from 'react-router-dom'

export default function UserDetail() {
  const { id } = useParams()

  return (
    <div>
      <h1>User Detail</h1>
      <p>Viewing user with ID: <strong>{id}</strong></p>
      <Link to="/users">Back to users</Link>
    </div>
  )
}
