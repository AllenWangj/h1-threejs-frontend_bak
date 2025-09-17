<template>
  <el-container class="h-screen">
    <!-- <layout-sidebar /> -->
    <el-container direction="vertical">
      <el-main class="flex p-0">
        <div class="flex-1 flex-col flex shadow-sm min-w-[1000px] overflow-auto p-[20px] pt-0">
          <slot />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="less" scoped></style>
