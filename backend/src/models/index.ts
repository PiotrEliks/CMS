import { User } from './user.model.js';
import { Role } from './role.model.js';
import { Category } from './category.model.js';
import { Content } from './content.model.js';
import { Media } from './media.model.js';
import { KeyValue } from './keyValue.model.js';
import { Menu } from './menu.model.js';
import { MenuItem } from './menuItem.model.js';
import { ContentCategory } from './contentCategory.model.js';
import { ContentsMedia } from './contentsMedia.model.js';
import { ContentMenu } from './contentMenu.model.js';
import { Permission } from './permission.model.js';
import { RolePermission } from './role_permission.model.js';

export {
  User,
  Role,
  Category,
  Content,
  Media,
  KeyValue,
  Menu,
  MenuItem,
  ContentCategory,
  ContentsMedia,
  ContentMenu,
  Permission,
  RolePermission,
};

export function setupAssociations() {
  Role.hasMany(User, {
    foreignKey: { name: 'role_id', allowNull: true },
    as: 'users',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  User.belongsTo(Role, {
    foreignKey: { name: 'role_id', allowNull: true },
    as: 'role',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  User.hasMany(Content, {
    foreignKey: { name: 'created_by', allowNull: true },
    sourceKey: 'user_id',
    as: 'createdContents',
    onDelete: 'SET NULL',
  });
  User.hasMany(Content, {
    foreignKey: { name: 'updated_by', allowNull: true },
    sourceKey: 'user_id',
    as: 'updatedContents',
    onDelete: 'SET NULL',
  });
  Content.belongsTo(User, {
    foreignKey: { name: 'created_by', allowNull: true },
    targetKey: 'user_id',
    as: 'creator',
    onDelete: 'SET NULL',
  });
  Content.belongsTo(User, {
    foreignKey: { name: 'updated_by', allowNull: true },
    targetKey: 'user_id',
    as: 'updater',
    onDelete: 'SET NULL',
  });

  Media.hasMany(Content, {
    foreignKey: { name: 'cover_media_id', allowNull: true },
    as: 'coverOf',
    onDelete: 'SET NULL',
  });
  Content.belongsTo(Media, {
    foreignKey: { name: 'cover_media_id', allowNull: true },
    as: 'cover',
    onDelete: 'SET NULL',
  });

  Content.belongsToMany(Category, {
    through: ContentCategory,
    foreignKey: { name: 'content_id', allowNull: false },
    otherKey: { name: 'category_id', allowNull: false },
    as: 'categories',
    onDelete: 'CASCADE',
  });
  Category.belongsToMany(Content, {
    through: ContentCategory,
    foreignKey: { name: 'category_id', allowNull: false },
    otherKey: { name: 'content_id', allowNull: false },
    as: 'contents',
    onDelete: 'CASCADE',
  });

  Content.belongsToMany(Media, {
    through: ContentsMedia,
    foreignKey: { name: 'content_id', allowNull: false },
    otherKey: { name: 'media_id', allowNull: false },
    as: 'media',
    onDelete: 'CASCADE',
  });
  Media.belongsToMany(Content, {
    through: ContentsMedia,
    foreignKey: { name: 'media_id', allowNull: false },
    otherKey: { name: 'content_id', allowNull: false },
    as: 'contents',
    onDelete: 'CASCADE',
  });

  User.hasMany(KeyValue, {
    foreignKey: { name: 'user_id', allowNull: true },
    sourceKey: 'user_id',
    onDelete: 'SET NULL',
  });
  KeyValue.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: true },
    targetKey: 'user_id',
    as: 'creator',
    onDelete: 'SET NULL',
  });

  Menu.belongsToMany(Content, {
    through: ContentMenu,
    foreignKey: { name: 'menu_id', allowNull: false },
    otherKey: { name: 'content_id', allowNull: false },
    as: 'contents',
    onDelete: 'CASCADE',
  });
  Content.belongsToMany(Menu, {
    through: ContentMenu,
    foreignKey: { name: 'content_id', allowNull: false },
    otherKey: { name: 'menu_id', allowNull: false },
    as: 'menus',
    onDelete: 'CASCADE',
  });

  Menu.hasMany(MenuItem, {
    foreignKey: { name: 'menu_id', allowNull: false },
    as: 'items',
    onDelete: 'CASCADE',
  });
  MenuItem.belongsTo(Menu, {
    foreignKey: { name: 'menu_id', allowNull: false },
    onDelete: 'CASCADE',
  });

  MenuItem.hasMany(MenuItem, {
    foreignKey: { name: 'parent_id', allowNull: true },
    as: 'children',
    onDelete: 'CASCADE',
  });
  MenuItem.belongsTo(MenuItem, {
    foreignKey: { name: 'parent_id', allowNull: true },
    as: 'parent',
    onDelete: 'SET NULL',
  });

  Content.hasMany(MenuItem, {
    foreignKey: { name: 'content_id', allowNull: true },
    onDelete: 'SET NULL',
  });
  MenuItem.belongsTo(Content, {
    foreignKey: { name: 'content_id', allowNull: true },
    as: 'content',
    onDelete: 'SET NULL',
  });

  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions',
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles',
  });
}
