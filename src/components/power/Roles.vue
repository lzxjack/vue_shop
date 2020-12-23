<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" class="addRole" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="roleslist" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级、三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环 嵌套渲染二级权限 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 编辑按钮 -->
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <!-- 删除按钮 -->
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改角色的对话框 -->
        <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRolesInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 所有角色列表数据
            roleslist: [],
            // 控制添加角色对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                roleName: '',
                roleDesc: '',
            },
            // 添加表单的验证规则对象
            addFormRules: {
                roleName: [
                    {
                        required: true,
                        message: '请输入角色名',
                        trigger: 'blur',
                    },
                    {
                        min: 2,
                        max: 6,
                        message: '角色名的长度在2~6个字符之间！',
                        trigger: 'blur',
                    },
                ],
                roleDesc: [
                    {
                        required: true,
                        message: '请输入角色描述',
                        trigger: 'blur',
                    },
                    {
                        min: 2,
                        max: 16,
                        message: '角色描述的长度在2~16个字符之间！',
                        trigger: 'blur',
                    },
                ],
            },
            // 控制修改角色对话框的显示与隐藏
            editDialogVisible: false,
            // 查询到的用户信息对象
            editForm: {},
            // 修改表单的验证规则对象
            editFormRules: {
                roleName: [
                    {
                        required: true,
                        message: '请输入角色名',
                        trigger: 'blur',
                    },
                    {
                        min: 2,
                        max: 6,
                        message: '角色名的长度在2~6个字符之间！',
                        trigger: 'blur',
                    },
                ],
                roleDesc: [
                    {
                        required: true,
                        message: '请输入角色描述',
                        trigger: 'blur',
                    },
                    {
                        min: 2,
                        max: 16,
                        message: '角色描述的长度在2~16个字符之间！',
                        trigger: 'blur',
                    },
                ],
            },
            // 控制分配权限对话框的显示与隐藏
            setRightDialogVisible: false,
            // 所有权限的数据
            rightslist: [],
            // 树形控件的树形绑定对象
            treeProps: {
                label: 'authName',
                children: 'children',
            },
            // 默认选中的节点Id值数组
            defKeys: [],
            // 当前即将分配角色的Id值
            roleId: '',
        };
    },
    created() {
        this.getRolesList();
    },
    methods: {
        // 获取所有角色的列表
        async getRolesList() {
            const { data: res } = await this.$http.get('roles');
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！');
            }
            this.roleslist = res.data;
            // console.log(this.roleslist);
        },
        // 监听添加用户对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        addRole() {
            this.$refs.addFormRef.validate(async (valid) => {
                // console.log(valid );
                if (!valid) return;
                // 可以发起添加用户的网络请求
                const { data: res } = await this.$http.post('roles', this.addForm);

                if (res.meta.status !== 201) {
                    this.$message.error('添加角色失败！');
                }
                this.$message.success('添加角色成功！');
                // 隐藏对话框
                this.addDialogVisible = false;
                // 重新获取用户列表
                this.getRolesList();
            });
        },
        // 展示修改角色的对话框
        async showEditDialog(id) {
            // console.log(id);
            const { data: res } = await this.$http.get('roles/' + id);
            if (res.meta.status !== 200) {
                return this.$message.error('查询角色信息失败！');
            }
            this.editForm = res.data;
            // console.log(res.data)
            this.editDialogVisible = true;
        },
        // 监听修改角色对话框的关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 修改角色信息并提交
        editRolesInfo() {
            this.$refs.editFormRef.validate(async (valid) => {
                // console.log(valid);
                if (!valid) return;
                // 发起修改角色信息的网络请求
                const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc,
                });
                if (res.meta.status !== 200) {
                    return this.$message.error('更新角色信息失败！');
                }
                // 关闭对话框
                this.editDialogVisible = false;
                // 重新渲染数据列表
                this.getRolesList();
                // 提示修改成功
                return this.$message.success('更新角色信息成功！');
            });
        },
        // 根据ID删除角色信息
        async removeRoleById(id) {
            // 弹框询问用户是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).catch((err) => err);

            // 确认删除，返回值为字符串confirm
            // 取消删除，返回值为字符串cancel
            if (confirmResult !== 'confirm') {
                return this.$message.info('角色信息未删除！');
            }
            const { data: res } = await this.$http.delete('roles/' + id);
            if (res.meta.status !== 200) {
                return this.$message.error('删除角色失败！');
            }
            this.$message.success('删除角色成功！');
            // 重新渲染数据列表
            this.getRolesList();
        },
        // 根据ID删除对应的权限
        async removeRightById(role, rightId) {
            // 弹框提示用户是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).catch((err) => err);
            if (confirmResult !== 'confirm') {
                return this.$message.info('权限未删除！');
            }

            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败！');
            }
            this.$message.success('删除权限成功！');
            // 返回的data, 是当前角色下最新的权限数据
            // 防止整个页面的刷新，只需重新赋值即可，不要重新渲染列表
            role.children = res.data;
        },
        // 通过递归，获取角色下所有的三级权限的id，并保存到defKeys数组中
        getLeafKeys(node, arr) {
            // 当前节点不包含children属性，则是三级节点
            if (!node.children) {
                return arr.push(node.id);
            }

            // 不是三级节点，继续调用
            node.children.forEach((item) => this.getLeafKeys(item, arr));
        },
        // 展示分配权限的对话框
        async showSetRightDialog(role) {
            // 打开就获取角色的ID
            this.roleId = role.id;
            // 获取所有权限数据
            const { data: res } = await this.$http.get('rights/tree');
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限列表失败！');
            }
            // 获取到的权限数据保存到data中
            this.rightslist = res.data;
            // console.log(this.rightslist);

            // 递归获取三级节点的Id
            this.getLeafKeys(role, this.defKeys);

            // 打开对话框
            this.setRightDialogVisible = true;
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClosed() {
            this.defKeys = [];
        },
        // 分配权限
        async allotRights() {
            // 将勾选的权限保存到数组中
            const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()];
            // 转化为字符串，用','分隔
            const idStr = keys.join(',');
            // console.log(idStr);
            // 发送角色授权请求
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr });

            if (res.meta.status !== 200) {
                return this.$message.error('分配权限失败！');
            }

            this.$message.success('分配权限成功！');
            // 刷新角色列表
            this.getRolesList();
            // 隐藏对话框
            this.setRightDialogVisible = false;
        },
    },
};
</script>

<style lang="less" scoped>
.addRole {
    margin-bottom: 15px;
}
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
// 纵向居中
.vcenter {
    display: flex;
    align-items: center;
}
</style>