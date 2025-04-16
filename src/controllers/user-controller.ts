import { User } from '../models/user';
import { Parse } from '../lib/parse';
import { ParseCloudCode } from '../lib/helpers/parse-cloud-code';

export class UserController {

  private user: User;

  constructor(user: User) {
    this.user = user;
  }

  public static async getCurrentUserData() {
    const user = await Parse.User.current() as User;
    return user;
  }

  public static async updateUserProfile(data: any) : Promise<User> {
    const user = await UserController.getCurrentUserData();
    data.objectId = user.id;
    
    const result = await ParseCloudCode.updateUserProfile(data);
    const resultFormated = JSON.parse(result);
    return resultFormated.success;

    /*user.setFirstName(data.firstName);
    user.setLastName(data.lastName);
    user.setEmail(data.email);
    user.setSpecialty(data.specialty);

    await user.save();*/
  }

}

