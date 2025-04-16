import { User } from "../../models/user";
import { PermissionParams } from "../config/permission-params";

export class MainHelper {

    public static getFullName(user: User): string {
        return `${user.getFirstName()} ${user.getLastName()}`;
    }

    public static getUserRole(role: string): string {

        switch (role) {
            case User.superAdminRole:
                return 'Super Admin';
            case User.adminRole:
                return 'Admin';
            case User.userRole:
                return 'User';
            case User.parentRole:
                return 'Parent';
            case User.therapistRole:
                return 'Therapist';
            case User.receptionistRole:
                return 'Receptionist';
            case User.nurseRole:
                return 'Nurse';
            case User.psychologistRole:
                return 'Psychologist';
            case User.managerRole:
                return 'Manager';
            case User.employeeRole:
                return 'Employee';
            case User.clientRole:
                return 'Client';
            default:
                return role;
        }
    }

    public static convertToValidRoleFormat(role: string): string {

        switch (role) {
            case 'Super Admin':
                return User.superAdminRole;
            case 'Admin':
                return User.adminRole;
            case 'User':
                return User.userRole;
            case 'Parent':
                return User.parentRole;
            case 'Therapist':
                return User.therapistRole;
            case 'Receptionist':
                return User.receptionistRole;
            case 'Nurse':
                return User.nurseRole;
            case 'Psychologist':
                return User.psychologistRole;
            case 'Manager':
                return User.managerRole;
            case 'Employee':
                return User.employeeRole;
            case 'Client':
                return User.clientRole;
            default:
                return User.userRole;
        }
    }

    public static getUserAccountStatus(status:string): string{
        switch(status){
            case User.activeStatus:
                return "Active";
            case User.inactiveStatus:
                return "Inactive";    
            default:
                return ""    
        }
    }

    public static grantPermission(user: User, permission: string): boolean {

        if (!user) return false;    

        switch (permission) {
            case PermissionParams.permission_manage_clinical:
                return PermissionParams.manage_clinical_roles().includes(user.getRole());
            case PermissionParams.permission_manage_authorizations:
                return PermissionParams.manage_authorizations_roles().includes(user.getRole());
            case PermissionParams.permission_manage_payments:
                return PermissionParams.manage_payments_roles().includes(user.getRole());
            case PermissionParams.permission_manage_users:
                return PermissionParams.manage_users_roles().includes(user.getRole());
            case PermissionParams.permission_manage_settings:
                return PermissionParams.manage_settings_roles().includes(user.getRole());
            case PermissionParams.permission_manage_billing:
                return PermissionParams.manage_billing_roles().includes(user.getRole());
            case PermissionParams.permission_manage_notifications:
                return PermissionParams.manage_notifications_roles().includes(user.getRole());
            case PermissionParams.permission_manage_schedule:
                return PermissionParams.manage_schedule_roles().includes(user.getRole());
            case PermissionParams.permission_manage_documents:
                return PermissionParams.manage_documents_roles().includes(user.getRole());
            case PermissionParams.permission_manage_appointments:
                return PermissionParams.manage_appointments_roles().includes(user.getRole());
            case PermissionParams.permission_manage_tasks:
                return PermissionParams.manage_tasks_roles().includes(user.getRole());
            case PermissionParams.permission_manage_messages:
                return PermissionParams.manage_messages_roles().includes(user.getRole());
            case PermissionParams.permission_manage_analytics:
                return PermissionParams.manage_analytics_roles().includes(user.getRole());
            case PermissionParams.permission_manage_organization:
                return PermissionParams.manage_organization_roles().includes(user.getRole());
            case PermissionParams.permission_manage_timesheets:
                return PermissionParams.manage_timesheets_roles().includes(user.getRole());
            case PermissionParams.permission_manage_reports:
                return PermissionParams.manage_reports_roles().includes(user.getRole());
            default:
                return false;
        }
    }

    public static getAllUserRoles(): { label: string, value: string }[] {
        return [
            { label: "All", value: "all" },
            { label: MainHelper.getUserRole(User.superAdminRole), value: User.superAdminRole },
            { label: MainHelper.getUserRole(User.adminRole), value: User.adminRole },
            { label: MainHelper.getUserRole(User.managerRole), value: User.managerRole },
            { label: MainHelper.getUserRole(User.employeeRole), value: User.employeeRole },
            { label: MainHelper.getUserRole(User.clientRole), value: User.clientRole }
        ];
    }  
    
    public static getManagementUsersRoles(): { label: string, value: string }[] {
        return [
            { label: MainHelper.getUserRole(User.superAdminRole), value: User.superAdminRole },
            { label: MainHelper.getUserRole(User.adminRole), value: User.adminRole },
            { label: MainHelper.getUserRole(User.managerRole), value: User.managerRole }
        ];
    }

}