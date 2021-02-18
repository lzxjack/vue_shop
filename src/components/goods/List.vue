<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- table表格区 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格（元）" prop="goods_price" width="120px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="160px">
                    <template slot-scope="scope">
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background> </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 查询参数对象
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
            },
            // 商品列表
            goodslist: [],
            // 总数据条数
            total: 0,
        };
    },
    created() {
        this.getGoodsList();
    },
    methods: {
        // 根据分页获取对应的商品列表
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', {
                params: this.queryInfo,
            });
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品列表失败！');
            }
            this.$message.success('获取商品列表成功！');
            // console.log(res.data);
            this.goodslist = res.data.goods;
            this.total = res.data.total;
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getGoodsList();
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getGoodsList();
        },
        async removeById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).catch((err) => err);

            if (confirmResult !== 'confirm') {
                return this.$message.info('商品未删除！');
            }

            const { data: res } = await this.$http.delete(`goods/${id}`);
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败！');
            }
            this.$message.success('删除商品成功！');
            this.getGoodsList();
        },
        // 点击按钮，跳转到添加商品的页面
        goAddPage() {
            this.$router.push('/goods/add');
        },
    },
};
</script>

<style lang="less" scoped>
.el-table {
    margin-top: 15px;
}
.el-pagination {
    margin-top: 15px;
}
</style>