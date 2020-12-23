<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 警告区域 -->
            <el-alert title="注意：只允许为三级分类设置相关参数！" type="warning" :closable="false" show-icon> </el-alert>

            <!-- 选择商品分类 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader v-model="selectedCateKeys" :options="carelist" :props="cateProps" @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- TAB页 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数 -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数的按钮 -->
                    <el-button class="addBtn" type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand"></el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template>
                                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性的按钮 -->
                    <el-button class="addBtn" type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态动态参数表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand"></el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template>
                                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 添加参数的输入框 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 商品分类列表数据
            carelist: [],
            // 级联选择框的配置对象
            cateProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover',
            },
            // 级联选择框双向绑定的数组
            selectedCateKeys: [],
            // 被激活的TAB名称
            activeName: 'many',
            // 动态参数的数据
            manyTableData: [],
            // 静态参数的数据
            onlyTableData: [],
            // 控制添加对话框的显示与隐藏
            addDialogVisible: false,
            // 添加数据的表单数据对象
            addForm: {
                attr_name: '',
            },
            // 添加表单的验证规则对象
            addFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: '请输入参数名称！',
                        trigger: 'blur',
                    },
                ],
            },
        };
    },
    created() {
        this.getCateList();
    },
    methods: {
        // 获取所有的商品分类列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories');
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败！');
            }
            // 返回结果保存在carelist
            this.carelist = res.data;
            // console.log(this.carelist);
        },
        // 级联选中框变化会触发的函数
        handleChange() {
            this.getParamsData();
        },
        // TAB点击事件
        handleTabClick() {
            // console.log(this.activeName);
            this.getParamsData();
        },
        // 获取参数的列表数据函数
        async getParamsData() {
            // 不是三级分类
            if (this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = [];
                return;
            }
            // 是三级分类
            // 根据所选分类的id、TAB栏发送请求
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                params: { sel: this.activeName },
            });

            if (res.meta.status !== 200) {
                return this.$message.error('获取参数失败！');
            }
            // console.log(res.data);
            if (this.activeName === 'many') {
                this.manyTableData = res.data;
            } else {
                this.onlyTableData = res.data;
            }
        },
        // 监听对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
    },
    // 计算属性
    computed: {
        // 按钮禁用返回true，启用为false
        isBtnDisabled() {
            if (this.selectedCateKeys.length !== 3) {
                return true;
            }
            return false;
        },
        // 当前选中的三级分类ID
        cateId() {
            if (this.selectedCateKeys.length === 3) {
                // 返回三级分类，索引为2
                return this.selectedCateKeys[2];
            }
            return null;
        },
        // 动态计算标题的文本
        titleText() {
            if (this.activeName === 'many') {
                return '动态参数';
            } else {
                return '静态属性';
            }
        },
    },
};
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}
.addBtn {
    margin-bottom: 15px;
}
</style>