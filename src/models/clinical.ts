import Parse from 'parse';
import { User } from './user';

export class Clinical extends Parse.Object {

    public static className: string = 'Clinical';

    constructor() {
        super(Clinical.className);
    }

    public static activeStatus: string = 'active';
    public static inactiveStatus: string = 'inactive';

    public static keyCreatedAt: string = 'createdAt';
    public static keyUpdatedAt: string = 'updatedAt';
    public static keyObjectId: string = 'objectId';
    
    public static keyName: string = 'name';
    public static keyAddress: string = 'address';
    public static keyPhone: string = 'phone';
    public static keyEmail: string = 'email';
    public static keyWebsite: string = 'website';
    public static keyLogo: string = 'logo';

    public static keyManager: string = 'manager';
    public static keyStatus: string = 'status';

    public static keyEmployees: string = 'employees';
    public static keyClients: string = 'clients';

    public getCreatedAt(): Date { return this.getCreatedAt(); }

    public getObjectId(): string { return this.getObjectId(); }

    public setName(name: string): void { this.set(Clinical.keyName,name); }
    public getName(): string { return this.get(Clinical.keyName); }

    public setAddress(address: string): void { this.set(Clinical.keyAddress,address); }
    public getAddress(): string { return this.get(Clinical.keyAddress); }

    public setPhone(phone: string): void { this.set(Clinical.keyPhone,phone); }
    public getPhone(): string { return this.get(Clinical.keyPhone); }   

    public setEmail(email: string): void { this.set(Clinical.keyEmail,email); }
    public getEmail(): string { return this.get(Clinical.keyEmail); }

    public setWebsite(website: string): void { this.set(Clinical.keyWebsite,website); }
    public getWebsite(): string { return this.get(Clinical.keyWebsite); }
    
    public setLogo(logo: Parse.File): void { this.set(Clinical.keyLogo,logo); }
    public getLogo(): Parse.File { return this.get(Clinical.keyLogo); }

    public setManager(manager: User): void { this.set(Clinical.keyManager,manager); }
    public getManager(): User { return this.get(Clinical.keyManager); }

    public setStatus(status: string): void { this.set(Clinical.keyStatus,status); }
    public getStatus(): string { return this.get(Clinical.keyStatus); }

    public setEmployee(employee: String): void { this.addUnique(Clinical.keyEmployees,employee); }
    public setEmployees(employees: String[]): void { this.addAllUnique(Clinical.keyEmployees,employees); }
    public getEmployees(): String[] { return this.get(Clinical.keyEmployees); }

    public setClient(client: String): void { this.addUnique(Clinical.keyClients,client); }
    public setClients(clients: String[]): void { this.addAllUnique(Clinical.keyClients,clients); }
    public getClients(): String[] { return this.get(Clinical.keyClients); }

}