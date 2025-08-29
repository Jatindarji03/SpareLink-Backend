import Role from "../models/roleModel.js";
const createRole = async (req, res) => {
    try {
        const userRole = new Role(
            {
                roleName: "mechanic", permissions: [
                    { resources: 'products', actions: ['read'] },
                    { resources: 'orders', actions: ['create', 'read'] },
                    {resources:'quotation',actions:['read']}
                ]
            }
        );
        const adminRole = new Role(
            {
                roleName: "admin", permissions: [
                    { resources: 'products', actions: ['read'] },
                    { resources: 'orders', actions: ['read'] },
                    { resources: 'users', actions: ['create', 'read', 'update', 'delete'] },
                    { resources: 'suppliers', actions: ['create', 'read', 'update', 'delete'] },
                    { resources: 'categories', actions: ['create', 'read', 'update', 'delete'] },
                    { resources: 'brends', actions: ['create', 'read', 'update', 'delete'] },
                    { resources: 'models', actions: ['create', 'read', 'update', 'delete'] },
                ]
            }
        );
        const supplierRole = new Role(
            {
                roleName:"supplier",permissions:[
                    { resources: 'products', actions: ['create', 'read', 'update','delete'] },
                    { resources: 'orders', actions: ['read'] },
                    {resources:'quotation',actions:['create','read']}
                ]
            }
        )
        await userRole.save();
        await adminRole.save();
        await supplierRole.save();

        return res.status(201).json({ message: "UserRole created successfully", userRole, adminRole,supplierRole });
    } catch (error) {
        console.error("Error creating role:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}

const getRoles = async (req,res)=>{
    try{
        const roles = await Role.find();
        return res.status(200).json({ roles });
    }catch(error){
        console.error("Error fetching roles:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}
export { createRole,getRoles };