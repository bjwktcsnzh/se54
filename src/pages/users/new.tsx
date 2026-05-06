import { Link } from 'react-router-dom'

export default function NewUser() {
  return (
    <div>
      <h1>New User</h1>
      <p>Form to create a new user would go here.</p>
      <Link to="/users">Back to users</Link>
    </div>
  )
}
