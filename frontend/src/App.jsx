import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './pages/RootLayout';
import ErrorPage from './pages/ErrorPage';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import UploadId from './pages/UploadId';
import EnrollFace from './pages/EnrollFace';
import Results from './pages/Results';
import Elections from './pages/Elections';
import ElectionDetails from './pages/ElectionDetails';
import Candidates from './pages/Candidates';
import Congrats from './pages/Congrats';
import Logout from './pages/Logout';
import Admin2FA from './pages/Admin2FA';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Landing /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/upload-id', element: <UploadId /> },
      { path: '/enroll-face', element: <EnrollFace /> },
      { path: '/results', element: <Results /> },
      { path: '/elections', element: <Elections /> },
      { path: '/elections/:id', element: <ElectionDetails /> },
      { path: '/elections/:id/candidates', element: <Candidates /> },
      { path: '/congrats', element: <Congrats /> },
      { path: '/logout', element: <Logout /> },
      { path: '/admin-2fa', element: <Admin2FA /> },
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/users', element: <AdminUsers /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
