import Parse from 'parse';

export class User extends Parse.User {

    public static className: string = '_User';

    constructor(attributes: any) {
        super(attributes);
    }

    public static superAdminRole: string = 'PSA';
    public static adminRole: string = 'MDA';
    public static managerRole: string = 'RMG';
    public static employeeRole: string = 'PEM';
    public static clientRole: string = 'CTL';

    public static parentRole: string = 'PRT';
    public static therapistRole: string = 'THR';
    public static receptionistRole: string = 'REC';
    public static nurseRole: string = 'NUR';
    public static psychologistRole: string = 'PSY';
    public static userParentRole: string = 'UPR';
    public static userRole: string = 'USR';

    public static activeStatus: string = 'EVT';
    public static inactiveStatus: string = 'EVI';

    public static keyCreatedAt: string = 'createdAt';
    public static keyUpdatedAt: string = 'updatedAt';
    public static keyObjectId: string = 'objectId';
    public static keyId: string = 'id';

    public static keyFirstName: string = 'firstName';
    public static keyLastName: string = 'lastName';
    public static keyEmail: string = 'email';
    public static keyEmailPublic: string = 'email_public';
    public static keyPassword: string = 'password';
    public static keyUsername: string = 'username';
    public static keyEmailVerified: string = 'emailVerified';

    public static keyPhone: string = 'phone';
    public static keyAddress: string = 'address';
    public static keyCity: string = 'city';
    public static keyState: string = 'state';
    public static keyZip: string = 'zip';
    public static keyCountry: string = 'country';

    public static keyAvatar: string = 'avatar';

    public static keyRole: string = 'role';
    public static keyStatus: string = 'status';

    public static keySpecialties: string = 'specialties';
    public static keySpecialty: string = 'specialty';

    public getCreatedAt(): Date { return this.getCreatedAt(); }

    public getObjectId(): string { return this.getObjectId(); }

    public setFirstName(firstName: string): void { this.set(User.keyFirstName,firstName); }
    public getFirstName(): string { return this.get(User.keyFirstName);}
   
    public setLastName(lastName: string): void { this.set(User.keyLastName,lastName); }
    public getLastName(): string { return this.get(User.keyLastName);}

    public getEmail(): string { return this.get(User.keyEmailPublic);}    
    
    public setEmailVerified(emailVerified: boolean): void { this.set(User.keyEmailVerified,emailVerified); }
    public getEmailVerified(): boolean { return this.get(User.keyEmailVerified);}
    
    public setRole(role: string): void { this.set(User.keyRole,role); }
    public getRole(): string { return this.get(User.keyRole);}

    public setStatus(status: string): void { this.set(User.keyStatus,status); }
    public getStatus(): string { return this.get(User.keyStatus);}

    public getUsername(): string { return this.get(User.keyUsername);}

    public setPhone(phone: string): void { this.set(User.keyPhone,phone); }
    public getPhone(): string { return this.get(User.keyPhone);}

    public setAddress(address: string): void { this.set(User.keyAddress,address); }
    public getAddress(): string { return this.get(User.keyAddress);}        

    public setCity(city: string): void { this.set(User.keyCity,city); }
    public getCity(): string { return this.get(User.keyCity);}

    public setState(state: string): void { this.set(User.keyState,state); }
    public getState(): string { return this.get(User.keyState);}

    public setZip(zip: string): void { this.set(User.keyZip,zip); }
    public getZip(): string { return this.get(User.keyZip);}

    public setCountry(country: string): void { this.set(User.keyCountry,country); }
    public getCountry(): string { return this.get(User.keyCountry);}
    
    public setAvatar(avatar: Parse.File): void { this.set(User.keyAvatar,avatar); }
    public getAvatar(): Parse.File { return this.get(User.keyAvatar);}

    // public setSpecialty(specialty: string): void { this.addUnique(User.keySpecialties, specialty); }    
    public setSpecialties(specialties: string[]): void { this.addAllUnique(User.keySpecialties, specialties); }
    public getSpecialties(): string[] { return this.get(User.keySpecialties); }

    public setSpecialty(specialty: string): void { this.set(User.keySpecialty, specialty); }
    public getSpecialty(): string { return this.get(User.keySpecialty); }
    
}

