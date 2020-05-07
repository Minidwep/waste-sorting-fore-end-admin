<template>
  <div>
    <el-select
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
    </el-select>
    <el-button @click="getCourseByKey" type="primary" style="margin-left: 16px;">查询</el-button>
    <el-button @click="dialogVisible = true" type="success" style="margin-left: 16px;">添加</el-button>
    <br />
    <br />
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
      <el-table-column label="操作" min-width="!4%">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status == '1'"
            icon="el-icon-lock"
            @click="handleUnLock(scope.row)"
            type="warning"
            size="small"
          >解锁</el-button>
          <el-button
            v-if="scope.row.status == '0'"
            icon="el-icon-lock"
            @click="handleLock(scope.row)"
            type="success"
            size="small"
          >锁定</el-button>
          <el-button
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            type="primary"
            size="small"
          >编辑</el-button>
          <el-button
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            type="danger"
            size="small"
          >删除</el-button>
        </template>
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
    <!-- 抽屉信息 -->
    <el-drawer
      title="更新知识问答信息"
      :before-close="updateHandleClose"
      :visible.sync="updateDialog"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer"
    >
      <div class="demo-drawer__content">
        <el-form :model="updateForm">
          <el-form-item v-show="false" label="垃圾id" :label-width="formLabelWidth">
            <el-input v-model="updateForm.id" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="详情" :label-width="formLabelWidth">
            <el-input v-model="updateForm.info" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="答案" :label-width="formLabelWidth">
            <el-select v-model="updateForm.answer" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="drawer_footer">
          <el-button class="drawer_footer_item" @click="cancelUnpdateForm">关闭</el-button>
          <el-button
            class="drawer_footer_item"
            type="primary"
            @click="$refs.drawer.closeDrawer()"
            :loading="loading"
          >{{ loading ? '提交中 ...' : '确 定' }}</el-button>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="添加知识问答信息" :visible.sync="dialogVisible" width="30%">
      <el-form :model="createForm">
        <el-form-item label="详情" :label-width="formLabelWidth">
          <el-input v-model="createForm.info" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="答案" :label-width="formLabelWidth">
          <el-select v-model="createForm.answer" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createHandleClose()">确 定</el-button>
      </span>
    </el-dialog>
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
      updateDialog: false,
      updateForm: {
        id: "",
        info: "",
        answer: ""
      },
      createDialog: false,
      createForm: {
        info: "",
        answer: ""
      },
      formLabelWidth: "80px",
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
        .get(this.$baseUrl + "/admin/question/" + pn)
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
    handleLock(row) {
      let id = row.id;
      this.loading = true;
      this.$baseAxios
        .put(this.$baseUrl + "/admin/question/lock/" + id)
        .then(res => {
          console.log(res);
          if (res.data.code == 100) {
            this.loading = false;
            this.toPage(this.pagination.currentPage);
            this.$message({
              showClose: true,
              message: "锁定成功",
              type: "success",
              duration: 1000
            });
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
    handleUnLock(row) {
      let id = row.id;
      this.loading = true;
      this.$baseAxios
        .put(this.$baseUrl + "/admin/question/unlock/" + id)
        .then(res => {
          console.log(res);
          if (res.data.code == 100) {
            this.loading = false;
            this.toPage(this.pagination.currentPage);
            this.$message({
              showClose: true,
              message: "解锁成功",
              type: "success",
              duration: 1000
            });
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
    // 更新课程信息
    handleUpdate(row) {
      this.updateDialog = true;
      this.updateForm = row;
      // this.form.type = this.$options.filters["formatType"](row.type);
      this.updateForm.answer = "";
    },
    handleDelete(row) {
      console.log(row);
      this.$baseAxios
        .post(this.$baseUrl + "/admin/question/delete", row)
        .then(res => {
          if (res.data.code == 100) {
            // this.questionData.splice(index, 1);
            this.$message({
              showClose: true,
              message: "删除信息成功",
              type: "success",
              duration: 1000
            });
            this.toPage(
              Math.ceil((this.pagination.total - 1) / this.pagination.pageSize)
            );
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

    updateHandleClose(done) {
      if (this.loading) {
        return;
      }
      this.$confirm("确定要修改知识问答信息吗？")
        .then(_ => {
          this.loading = true;
          this.timer = setTimeout(() => {
            done();
            this.$baseAxios
              .put(this.$baseUrl + "/admin/question", this.updateForm)
              .then(res => {
                console.log(res);
                if (res.data.code == 100) {
                  this.loading = false;
                  this.toPage(this.pagination.currentPage);
                  this.$message({
                    showClose: true,
                    message: "修改信息成功",
                    type: "success",
                    duration: 1000
                  });
                } else {
                  this.$message({
                    showClose: true,
                    message: "修改信息失败",
                    type: "error",
                    duration: 1000
                  });
                }
              })
              .catch(err => {
                this.$message({
                  showClose: true,
                  message: "修改信息失败",
                  type: "error",
                  duration: 1000
                });
              });
          }, 1000);
        })
        .catch(_ => {});
    },
    cancelUnpdateForm() {
      this.loading = false;
      this.updateDialog = false;
      this.toPage(this.pagination.currentPage);
      clearTimeout(this.timer);
    },

    createHandleClose() {
      if (this.loading) {
        return;
      }
      this.$confirm("确定要添加知识问答信息吗？")
        .then(_ => {
          this.loading = true;
          this.timer = setTimeout(() => {
            this.$baseAxios
              .post(this.$baseUrl + "/admin/question", this.createForm)
              .then(res => {
                console.log(res);
                if (res.data.code == 100) {
                  this.loading = false;
                  this.toPage(
                    Math.ceil(
                      (this.pagination.total + 1) / this.pagination.pageSize
                    )
                  );

                  this.dialogVisible = false;
                  this.$message({
                    showClose: true,
                    message: "添加信息成功",
                    type: "success",
                    duration: 1000
                  });
                } else {
                  this.loading = false;
                  this.$message({
                    showClose: true,
                    message: "添加信息失败",
                    type: "error",
                    duration: 1000
                  });
                }
              })
              .catch(err => {
                this.$message({
                  showClose: true,
                  message: "添加信息失败",
                  type: "error",
                  duration: 1000
                });
              });
          }, 1000);
        })
        .catch(_ => {});
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
    }
  }
};
</script>

