import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import logo from '../../assets/logo.png'; // Adjust the p
import { checkAppInstallation } from '../../lib/parse'
import { ParseCloudCode } from '../../lib/helpers/parse-cloud-code';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';

const schema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  username: z.string().min(1),
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  password: z.string().min(1),
});

type formData = z.infer<typeof schema>;

export default function SetuoPage() {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    const checkInstallationStatus = async () => {
      const installationStatus = await checkAppInstallation();

      if (installationStatus) {
        navigate('/');
      }
    };

    checkInstallationStatus();
  }, [navigate, showError]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<formData>({ resolver: zodResolver(schema), });

  const onFormSubmit: SubmitHandler<formData> = async (data) => {
    try {

      const result = await ParseCloudCode.createSuperAdmin(data);

      if (result) {
        // console.log("Result:", result);
        showSuccess('App has been setup successfully.');

        navigate('/'); 
      } else {
        showError('Failed to setup the app. Please try again.');
      }

    // Redirect to home or another page
    } catch (error) {
      console.error('Error creating super admin:', error);
      showError('Failed to create super admin. Please try again.');
    } finally {
      // setIsSubmitting(false);
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img className="mx-auto h-20 w-auto" src={logo} alt="Totum Logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Setup Totum
          </h2>
          <p className="mt-2 text-center text-1xl font-normal text-dark-100">
            This page is used to setup the Totum app for the first time.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="first-name" className="sr-only">
                First Name
              </label>
              <input
                id="first-name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-3"
                placeholder="First Name"
                disabled={isSubmitting}
                {...register('firstName')}
              />
            </div>
            <div>
              <label htmlFor="last-name" className="sr-only">
                Last Name
              </label>
              <input
                id="last-name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-3"
                placeholder="Last Name"
                disabled={isSubmitting}
                {...register('lastName')}
              />
            </div>
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-3"
                placeholder="Username"
                disabled={isSubmitting}
                {...register('username')}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-3"
                placeholder="Email address"
                disabled={isSubmitting}
                {...register('email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mt-3"
                placeholder="Password"
                disabled={isSubmitting}
                {...register('password')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" color="text-white" />
              ) : (
                'Setup App'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}