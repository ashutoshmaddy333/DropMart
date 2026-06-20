export enum Permission {
  ProductCreate = "product:create",
  ProductRead = "product:read",
  ProductUpdate = "product:update",
  ProductDelete = "product:delete",
  OrderRead = "order:read",
  OrderProcess = "order:process",
  OrderReadOwn = "order:read:own",
  PaymentRead = "payment:read",
  PaymentRefund = "payment:refund",
  UserManage = "user:manage",
  AnalyticsRead = "analytics:read",
  PlatformConfig = "platform:config",
  SupplierManage = "supplier:manage",
  SupplierReadOwn = "supplier:read:own",
  RbacManage = "rbac:manage",
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.ProductCreate]: "Create Products",
  [Permission.ProductRead]: "View Products",
  [Permission.ProductUpdate]: "Edit Products",
  [Permission.ProductDelete]: "Delete Products",
  [Permission.OrderRead]: "View All Orders",
  [Permission.OrderProcess]: "Process Orders",
  [Permission.OrderReadOwn]: "View Own Orders",
  [Permission.PaymentRead]: "View Payments",
  [Permission.PaymentRefund]: "Issue Refunds",
  [Permission.UserManage]: "Manage Users",
  [Permission.AnalyticsRead]: "View Analytics",
  [Permission.PlatformConfig]: "Platform Config",
  [Permission.SupplierManage]: "Manage Suppliers",
  [Permission.SupplierReadOwn]: "View Own Supplier Data",
  [Permission.RbacManage]: "Manage RBAC",
};

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: "Catalog",
    permissions: [
      Permission.ProductCreate,
      Permission.ProductRead,
      Permission.ProductUpdate,
      Permission.ProductDelete,
    ],
  },
  {
    label: "Orders",
    permissions: [
      Permission.OrderRead,
      Permission.OrderProcess,
      Permission.OrderReadOwn,
    ],
  },
  {
    label: "Payments",
    permissions: [Permission.PaymentRead, Permission.PaymentRefund],
  },
  {
    label: "Users & Access",
    permissions: [
      Permission.UserManage,
      Permission.RbacManage,
      Permission.PlatformConfig,
    ],
  },
  {
    label: "Suppliers",
    permissions: [Permission.SupplierManage, Permission.SupplierReadOwn],
  },
  {
    label: "Analytics",
    permissions: [Permission.AnalyticsRead],
  },
];
