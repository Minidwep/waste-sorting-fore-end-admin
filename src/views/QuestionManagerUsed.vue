<template>
  <div >
    <!-- <el-select
      v-model="value"
      filterable
      remote
      reserve-keyword
      placeholder="请输入关键词"
      :remote-method="remoteMethod"
      :loading="loading"
      >
      <el-option
        v-for="item in searchOptions"
        :key="item.value"
        :label="item.name"
        :value="item.value"
      ></el-option>
    </el-select> -->
    <!-- <el-button @click="getCourseByKey" type="primary" style="margin-left: 16px;">查询</el-button> -->
    <el-button @click="handleRefresh()" type="success" style="margin-left: 16px;">重新发布题目</el-button>
    <br/><br/>
    <!-- 表格信息 -->
    <el-table class="my-table" v-loading="loading" :data="questionData" border row-key="id">
      >
      <el-table-column prop="info" label="题目" min-width="!4%" align="left"></el-table-column>
      <el-table-column prop="answer" label="答案" min-width="!4%" align="center">
        <template slot-scope="scope">{{ scope.row.answer | formatType }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="!4%" align="center">
        <template slot-scope="scope">{{ scope.row.status | formatStatus }}</template>
      </el-table-column>
      <el-table-column prop="auto" label="出题者" min-width="!4%" align="center">
        <template slot-scope="scope">{{ scope.row.auto | formatAuto }}</template>
      </el-table-column>
    </el-table>

    <br />
    <!-- 分页信息 -->
    <el-pagination
      class="item-center"
      background
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.currentPage"
      @current-change="handelCurrentChange($event)"
    ></el-pagination>
  </div>
</template>

<style>
.item-center {
  text-align: center;
}
.drawer_footer {
  display: flex;
  position: absolute;
  bottom: 100px;
  width: 100%;
}
.drawer_footer_item {
  flex: 1;
}
.my-table {
  width: 100%;
  min-height: 500px !important;
}
</style>

<script>
export default {
  name: "QuestionManager",
  data() {
    return {
      questionData: [],
      loading: false,
      pageInfo: "",
      dialogVisible: false,
      pagination: {
        total: 1,
        currentPage: 1,
        pageSize: 1
      },
      timer: null,
      // 搜索
      searchOptions: [],
      value: "",
      options: [
        {
          value: "0",
          label: "干垃圾"
        },
        {
          value: "1",
          label: "湿垃圾"
        },
        {
          value: "2",
          label: "可回收垃圾"
        },
        {
          value: "3",
          label: "有害垃圾"
        }
      ]
    };
  },
  created: function() {
    this.toPage(1);
  },
  filters: {
    formatType(type) {
      if (type == 0) return "干垃圾";
      if (type == 1) return "湿垃圾";
      if (type == 2) return "可回收垃圾";
      if (type == 3) return "有害垃圾";
    },
    formatStatus(status) {
      if (status == 0) return "未锁定";
      if (status == 1) return "已锁定";
    },
    formatAuto(auto) {
      if (auto == 0) return "系统";
      if (auto == 1) return "管理员";
    }
  },
  methods: {
    // 获取当前页
    handelCurrentChange(event) {
      this.toPage(event);
    },
    // 去pn页查询分页信息
    toPage(pn) {
      this.loading = true;
      this.$baseAxios
        .get(this.$baseUrl + "/admin/question/redis/" + pn)
        .then(res => {
          console.log(res);
          if (res.data.code == 100) {
            this.pageInfo = res.data.extend.pageInfo;
            this.questionData = this.pageInfo.list;
            this.pagination.total = this.pageInfo.total;
            this.pagination.currentPage = this.pageInfo.pageNum;
            this.pagination.pageSize = this.pageInfo.pageSize;
            this.loading = false;
          } else {
            this.$message({
              showClose: true,
              message: "请检查网络情况",
              type: "warning",
              duration: 1000
            });
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    // 模糊查询
    remoteMethod(query) {
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          console.log("search");
          this.loading = false;
          this.$baseAxios
            .get(this.$baseUrl + "/admin/question/keyword/" + query)
            .then(res => {
              console.log(res);
              let questionList = res.data.extend.questionList;

              let searchOptions = [];
              questionList.forEach(element => {
                let item = {
                  name: "",
                  value: ""
                };
                item.name =
                  element.info +
                  "-" +
                  this.$options.filters["formatType"](element.answer);
                item.value = element.id;
                searchOptions.push(item);
              });
              this.searchOptions = searchOptions;
            })
            .catch(err => {
              console.error(err);
            });
        }, 600);
      } else {
        this.searchOptions = [];
      }
    },
    // 精确查询
    getCourseByKey() {
      if (this.value == "") {
        this.$message({
          showClose: true,
          message: "查询内容不能为空",
          type: "warning",
          duration: 1000
        });
        return;
      }
      console.log(this.value);

      this.$baseAxios
        .get(this.$baseUrl + "/admin/question/search/" + this.value)
        .then(res => {
          if (
            res.data.extend.questionList == null ||
            res.data.extend.questionList == ""
          ) {
            this.$message({
              showClose: true,
              message: "查询内容为空",
              type: "warning",
              duration: 1000
            });
          } else {
            this.questionData = res.data.extend.questionList;
          }
        })
        .catch(err => {
          console.error(err);
        });
    },
    handleRefresh() {
      this.loading = true;
      setTimeout(() => {
        console.log("search");
        this.loading = false;
        this.$baseAxios
          .get(this.$baseUrl + "/admin/question/redis/refresh/")
          .then(res => {
            if (res.data.code == 100) {
              this.toPage(1);
              this.$message({
                showClose: true,
                message: "重新发布问题成功",
                type: "success",
                duration: 1000
              });
            }
          })
          .catch(err => {
            console.error(err);
          });
      }, 1000);
    }
  }
};
</script>

