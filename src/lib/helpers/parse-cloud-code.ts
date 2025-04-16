import Parse from 'parse/dist/parse.min.js';
import { ParseCloudCodeParams } from '../config/parse-cloud-code-params';

export class ParseCloudCode {
  
    public static createSuperAdmin(params: any): Promise<any> {
        return Parse.Cloud.run(ParseCloudCodeParams.createSuperAdmin, params);
    }

    public static signupUser(params: any): Promise<any> {
        const user = Parse.User.current();

        return Parse.Cloud.run(ParseCloudCodeParams.signupUser, {
          objectId: user.id, 
          data:params
        });
    }

    public static createNewInstallation(installationId: String): Promise<any> {
        return Parse.Cloud.run(
            ParseCloudCodeParams.createNewInstallation, { installationId:installationId }
        );
    }

    public static getManagementUsers(objectId: String): Promise<any> {
        return Parse.Cloud.run(
            ParseCloudCodeParams.getManagementUsers, { objectId:objectId }
        );
    }

    public static getManagementUsersCount(objectId: String): Promise<any> {
        return Parse.Cloud.run(
            ParseCloudCodeParams.getManagementUsersCount, { objectId:objectId }
        );
    }

    public static searchUers(objectId:String,searchTerm:String): Promise<any> {
        return Parse.Cloud.run(
            ParseCloudCodeParams.searchUsers, 
            { 
                objectId:objectId, 
                searchTerm:searchTerm 
            }
        );
    }

    public static updateUserProfile(params: any): Promise<any> {
        return Parse.Cloud.run(ParseCloudCodeParams.updateProfile, params);
    }

}
