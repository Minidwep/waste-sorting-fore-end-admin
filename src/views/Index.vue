<template>
  <div id="app">
    <el-container style="height: 700px; border: 1px solid #eee">
      <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu router :default-active="this.$route.path">
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-menu"></i>排行榜面板
            </template>
            <el-menu-item index="/RankManager">查看排行榜</el-menu-item>
          </el-submenu>

          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-setting"></i>管理知识问答信息
            </template>
            <el-menu-item index="/QuestionManager">知识问答信息</el-menu-item>
            <el-menu-item index="/QuestionManagerUsed">已发布知识问答</el-menu-item>
          </el-submenu>

          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-setting"></i>管理垃圾分类信息
            </template>
            <el-menu-item index="/RubbishManager">垃圾分类信息</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <span>管理员</span>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
      defaultActiveIndex: "/"
    };
  },
  created() {
    console.log(this.$route.path);
  },

  methods: {
    getRoutePath() {
      console.log(this.$route.path);
    }
  }
};
</script>

<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
</style>