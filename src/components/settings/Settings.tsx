import { useState } from 'react';
import { Settings as SettingsIcon, User2, Bell, Lock, Globe, CreditCard } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useToast } from '../../hooks/useToast';
import NotificationTab from './NotificationTab';
import SecurityTab from './SecurityTab';
import PreferencesTab from './PreferencesTab';
import AdvancedTab from './AdvancedTab';
import BillingTab from './BillingTab';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserController } from '../../controllers/user-controller';
import { MainHelper } from '../../lib/helpers/main-helper';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  username: z.string().readonly(),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  //email: z.string().readonly()/*.min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' })*/,
  //role: z.string().readonly(),
  specialty: z.string().optional(),
});

type profileFormData = z.infer<typeof schema>;

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('Profile');
  const { updateUser } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<profileFormData>(
    {
      defaultValues: async () => {
        const user = await UserController.getCurrentUserData();

        return {
          username: user.getUsername(),
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          email: user.getEmail(),
          role: MainHelper.getUserRole(user.getRole()),
          specialty: user.getSpecialty() ?? '',
        };
      },
      resolver: zodResolver(schema),
    }
  );

  const onProfileFormSubmit: SubmitHandler<profileFormData> = async (data) => {

    try {
      const response = await UserController.updateUserProfile(data);

      if(response){
        updateUser(); 
        showSuccess('Profile updated successfully');
      } else {
        showError('Failed to update profile');
      }
    
    } catch (error) {
      showError('Failed to update profile');
    }
  }

  const handleTabClick = (label: string) => {
    setActiveTab(label);
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <nav className="space-y-1">
            {[
              { icon: User2, label: 'Profile' },
              { icon: Bell, label: 'Notifications' },
              { icon: Lock, label: 'Security' },
              { icon: Globe, label: 'Preferences' },
              { icon: CreditCard, label: 'Billing' },
              { icon: SettingsIcon, label: 'Advanced' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(item.label)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full text-left ${
                  activeTab === item.label
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'Profile' && (
            <>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
              <form className="space-y-6" onSubmit={handleSubmit(onProfileFormSubmit)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Username"
                    disabled
                    {...register('username')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="First Name"
                    {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Last Name"
                    {...register('lastName')}
                  />
                </div>
                {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
                { /*<div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    //type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="john@example.com"
                    disabled
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Therapist"
                    disabled
                    {...register('role')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Specialties
                  </label>
                  <input
                    type="text"
                    id="specialty"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Specialty"
                    {...register('specialty')}
                  />
                </div> */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>  
              </form>
            </>
          )}
          {activeTab === 'Notifications' && (
            <>
              <NotificationTab user="" />
            </>
          )}
          {activeTab === 'Security' && (
            <>
              <SecurityTab user="" />
            </>
          )}
          {activeTab === 'Preferences' && (
            <>
              <PreferencesTab user="" />
            </>
          )}
          {activeTab === 'Billing' && (
            <>    
              <BillingTab user="" />
            </>
          )}
          {activeTab === 'Advanced' && (
            <>
              <AdvancedTab user="" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

