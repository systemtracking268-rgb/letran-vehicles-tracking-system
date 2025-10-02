import { Router } from 'express';
import { loginUser, registerUser } from "../services/firebaseService.js";

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await loginUser(username, password);
  if (result.success) {
    return res.json(result);
  } else {
    return res.status(result.status || 500).json(result);
  }
});

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const result = await registerUser(username, password, email);
  if (result.success) {
    return res.json(result);
  } else {
    return res.status(result.status || 500).json(result);
  }
});

export default router;