import Role from "../models/roleModel.js";

//Middleware to check user has a specfic permission
const checkPermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated (should be set by authMiddleWare
            if (!req.user) {
                return res.status(401).json(
                    { message: "Unauthorized: User not authenticated" }
                );
            }
            //check if user has a role assigned
            if (!req.user.roleName) {
                return res.status(401).json({
                    message: "Forbidden: User has no role assigned"
                })
            }
            //Fetching The Role Permission
            const roles = await Role.findById(req.user.roleId);

            if (!roles) {
                return res.status(401).json({
                    message: "Forbidden : Role Not Found"
                })
            }
            // Check if user has the specific permission for the resource
            const hasPermission = roles.permissions.some(permissions =>
                permissions.resources === resource && permissions.actions.includes(action));
            if(!hasPermission){
                console.log("Permission Denied: User lacks required permission");
                 return res.status(403).json({ 
                    message: "Forbidden: Insufficient permissions",
                    required: `${resource}:${action}`,
                    userRole: req.user.roleName
                });
            }
             console.log(`Permission granted for user ${req.user.id}: ${resource}:${action} (Role: ${req.user.roleName})`);
            
            // Add user permissions to request for potential use in route handlers
            req.user.permissions = roles.permissions;
            next();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};

export default checkPermission;