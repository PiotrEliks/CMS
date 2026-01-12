import { Router } from 'express';
import * as SettingsController from '../../controllers/site/siteSettings.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', authorize('settings.read'), SettingsController.getAllSettings);
router.get('/:key', authorize('settings.read'), SettingsController.getSettingByKey);
router.put('/:key', authorize('settings.update'), SettingsController.updateSettings);
router.post('/:key', authorize('settings.update'), SettingsController.setSettings);

export default router;
