import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="mx-auto my-20 max-w-xl rounded-xl bg-white p-10 shadow-lg">
      <h1 className="text-3xl font-semibold text-slate-900">Unauthorized</h1>
      <p className="mt-4 text-slate-600">
        You do not have permission to view this page. If you believe this is an error, contact your administrator.
      </p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">
        Return to dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
