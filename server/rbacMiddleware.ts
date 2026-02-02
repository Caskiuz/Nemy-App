import { Request, Response, NextFunction } from "express";
import { AuthorizationError } from "./errors";
import { logger } from "./logger";

export type Role = "customer" | "business" | "delivery" | "admin";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email?: string;
  };
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      throw new AuthorizationError("Authentication required");
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      logger.security("Unauthorized access attempt", {
        userId: authReq.user.id,
        role: authReq.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      throw new AuthorizationError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      );
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole("admin")(req, res, next);
}

export function requireBusinessOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return requireRole("business", "admin")(req, res, next);
}

export function requireDeliveryOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  return requireRole("delivery", "admin")(req, res, next);
}

export function requireOwnership(resourceUserIdField: string = "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      throw new AuthorizationError("Authentication required");
    }

    if (authReq.user.role === "admin") {
      return next();
    }

    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (resourceUserId !== authReq.user.id) {
      logger.security("Ownership violation attempt", {
        userId: authReq.user.id,
        attemptedResource: resourceUserId,
        path: req.path,
      });
      throw new AuthorizationError("You can only access your own resources");
    }

    next();
  };
}

export const permissions = {
  orders: {
    create: ["customer"],
    viewOwn: ["customer", "business", "delivery"],
    viewAll: ["admin"],
    update: ["business", "delivery", "admin"],
    cancel: ["customer", "business", "admin"],
  },
  businesses: {
    create: ["admin"],
    update: ["business", "admin"],
    delete: ["admin"],
    viewAll: ["customer", "business", "delivery", "admin"],
  },
  drivers: {
    register: ["customer"],
    approve: ["admin"],
    viewAll: ["admin"],
    updateOwn: ["delivery"],
  },
  wallets: {
    viewOwn: ["business", "delivery"],
    withdraw: ["business", "delivery"],
    viewAll: ["admin"],
  },
  settings: {
    view: ["admin"],
    update: ["admin"],
  },
};
