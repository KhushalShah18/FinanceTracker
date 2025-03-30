import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCategorySchema, extendedCategorySchema,
  insertTransactionSchema, extendedTransactionSchema
} from '@shared/schema';
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Error handling middleware for Zod validation
  const handleValidation = (schema: any) => async (req: Request, res: Response, next: Function) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  };

  // Categories routes
  app.get("/api/categories", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to get categories" });
    }
  });

  app.post("/api/categories", 
    ensureAuthenticated, 
    handleValidation(extendedCategorySchema), 
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const category = await storage.createCategory({
          ...req.body,
          userId
        });
        res.status(201).json(category);
      } catch (error) {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  );

  app.put("/api/categories/:id", 
    ensureAuthenticated, 
    handleValidation(extendedCategorySchema.partial()), 
    async (req: Request, res: Response) => {
      try {
        const categoryId = parseInt(req.params.id);
        const category = await storage.getCategoryById(categoryId);
        
        if (!category) {
          return res.status(404).json({ message: "Category not found" });
        }
        
        if (category.userId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const updatedCategory = await storage.updateCategory(categoryId, req.body);
        res.json(updatedCategory);
      } catch (error) {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  );

  app.delete("/api/categories/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      if (category.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  app.post("/api/transactions", 
    ensureAuthenticated, 
    handleValidation(extendedTransactionSchema), 
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const transaction = await storage.createTransaction({
          ...req.body,
          userId
        });
        res.status(201).json(transaction);
      } catch (error) {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  );

  app.put("/api/transactions/:id", 
    ensureAuthenticated, 
    handleValidation(extendedTransactionSchema.partial()), 
    async (req: Request, res: Response) => {
      try {
        const transactionId = parseInt(req.params.id);
        const transaction = await storage.getTransactionById(transactionId);
        
        if (!transaction) {
          return res.status(404).json({ message: "Transaction not found" });
        }
        
        if (transaction.userId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
        res.json(updatedTransaction);
      } catch (error) {
        res.status(500).json({ message: "Failed to update transaction" });
      }
    }
  );

  app.delete("/api/transactions/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTransaction(transactionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
