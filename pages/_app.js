import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return <><Component {...pageProps} /><Toaster position="top-right" toastOptions={{ duration: 3500 }} /></>;
}
