import { User } from "../../models/user";

export class PermissionParams {
    public static permission_manage_clinical: string = 'manage_clinical';
    public static permission_manage_authorizations: string = 'manage_authorizations';
    public static permission_manage_payments: string = 'manage_payments';
    public static permission_manage_users: string = 'manage_users';
    public static permission_manage_settings: string = 'manage_settings';
    public static permission_manage_billing: string = 'manage_billing';
    public static permission_manage_notifications: string = 'manage_notifications';
    public static permission_manage_schedule: string = 'manage_schedule';
    public static permission_manage_documents: string = 'manage_documents';
    public static permission_manage_appointments: string = 'manage_appointments';
    public static permission_manage_tasks: string = 'manage_tasks';
    public static permission_manage_messages: string = 'manage_messages';
    public static permission_manage_analytics: string = 'manage_analytics';
    public static permission_manage_organization: string = 'manage_organization';
    public static permission_manage_timesheets: string = 'manage_timesheets';
    public static permission_manage_reports: string = 'manage_reports';

    public static manage_clinical_roles(): string[] {
        return [
            User.superAdminRole,
            // User.adminRole,
            User.therapistRole,
            User.nurseRole,
            User.psychologistRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_authorizations_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
        ];
    }

    public static manage_payments_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_users_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
        ];
    }

    public static manage_settings_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
        ];
    }

    public static manage_billing_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_notifications_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_schedule_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_documents_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_appointments_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_tasks_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_messages_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_analytics_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
        ];
    }

    public static manage_organization_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
        ];
    }

    public static manage_timesheets_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
            User.employeeRole,
        ];
    }

    public static manage_reports_roles(): string[] {
        return [
            User.superAdminRole,
            User.adminRole,
            User.managerRole,
        ];
    }

}    