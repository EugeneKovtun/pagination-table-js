<template>
  <div class="main__container">
    <div class="main__content--json-parser">
      <input class="form-control" ref="linkToJson" placeholder="insert link to json" type="text">
      <button @click="getDataFromJson">get data</button>
      <button @click="returnData">return Data</button>
    </div>
    <div class="main__content--settings__block">
      <p>Show
        <select @change="currentPage = 1" class="custom-select" v-model="pageSize" name="itemCount" id="">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
        </select>
        entries per page
      </p>
      <div class="main__content--settings__block__search-block">
        <p>search:</p>
        <input v-model="searchInTable" class="form-control" type="text">
      </div>
    </div>
    <table class="table table-striped">
      <thead>
      <tr v-if="i === 0" v-for="(add, i) in sortedData">
        <th @click="sort(i)" v-for="(ad, i) in add" scope="col">{{i}}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="add in sortedData">
        <td @click="editData" :class="i" v-for="(ad, i) in add" scope="col">{{ad}}</td>
      </tr>
      </tbody>
    </table>
    <div class="main__content--under-table__content">
      <div class="status--shower">
        Showing {{start+1}} to {{end}} entries
      </div>
      <div class="pagination">
        <button @click="prevPage">Previous</button>
        <p @click="setPage(i)" v-for="i in paginationWithDots(currentPage, pageCounter)">{{i}}</p>
        <button @click="nextPage">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        currentSort: 'ID',
        currentSortDir: 'asc',
        pageSize: 5,
        currentPage: 1,
        pages: [],
        start: 0,
        end: 0,
        searchInTable: '',
        counterPosts: 0,
        pageCounter: 0,
        isEdit: false
      }
    },
    mounted() {
      this.$store.dispatch('getNotes')
    },
    watch: {
      searchInTable() {
        this.currentPage = 1
      }
    },
    methods: {
      sort(s) {
        if (s === this.currentSort) {
          this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
        }
        this.currentSort = s;
      },
      nextPage() {
        if (this.currentPage < this.pageCounter) this.currentPage++;
      },
      prevPage() {
        if (this.currentPage > 1) this.currentPage--;
      },
      setPage(i) {
        if (i !== '...') {
          this.currentPage = i
        }
      },
      getDataFromJson() {
        this.$store.dispatch('getNotesFromJson', this.$refs.linkToJson.value)
      },
      returnData() {
        this.$store.dispatch('getNotes')
      },
      paginationWithDots(start, max) {
        let current = start,
          last = max,
          delta = 1,
          left = current - delta,
          right = current + delta + 1,
          range = [],
          rangeWithDots = [],
          l;
        for (let i = 1; i <= last; i++) {
          if (i === 1 || i === last || i >= left && i < right) {
            range.push(i);
          }
        }
        for (let i of range) {
          if (l) {
            if (i - l === 2) {
              rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
              rangeWithDots.push('...');
            }
          }
          rangeWithDots.push(i);
          l = i;
        }
        return rangeWithDots;
      },
      editData(event) {
        if (event.target.tagName === 'TD' && !this.isEdit) {
          this.isEdit = true
          let el = document.createElement('input')
          let btn = document.createElement('button')
          el.value = event.target.innerHTML
          btn.innerHTML = 'ok'
          event.target.innerHTML = ''
          event.target.appendChild(el)
          event.target.appendChild(btn)
          btn.addEventListener('click', () => {
            this.isEdit = false
            event.target.innerHTML = el.value
            const ID = event.target.parentNode.children[0].innerHTML
            const IDClass = event.target.parentNode.children[0].className
            const post = {}
            for (let key in this.data[ID]) {
              if (key === event.target.className) {
                post[key] = el.value
              } else post[key] = this.data[ID - 1][key]
            }
            post[1] = IDClass
            this.$store.commit('editPost', post)
          })
        }
      }
    },
    computed: {
      data() {
        return this.$store.getters.getAd
      },
      sortedData() {
        this.counterPosts = 0
        return this.data
          .filter((row, index) => {
            for (let key in row) {
              row[key] += ''
              if (row[key].includes(this.searchInTable)) {
                this.counterPosts++
                return true
              }
            }
          })
          .filter((row, index) => {
            let start = (this.currentPage - 1) * this.pageSize;
            this.start = start;
            let end = this.currentPage * this.pageSize;
            this.pageCounter = Math.ceil(this.counterPosts / this.pageSize);
            if (this.data.length - end < 1) {
              this.end = this.counterPosts
            } else this.end = end;
            if (index >= start && index < end) return true;
          })
          .sort((a, b) => {
            let modifier = 1;
            if (this.currentSortDir === 'desc') modifier = -1;
            if (parseInt(a[this.currentSort]) < parseInt(b[this.currentSort])) return -1 * modifier;
            if (parseInt(a[this.currentSort]) > (b[this.currentSort])) return modifier;
            return 0
          })
      }
    }
  }
</script>

<style scoped>
  * {
    text-align: left;
  }

  .main__container {
    margin: 0 20px;
  }

  .main__content--json-parser {
    margin: 20px 0;
    display: flex;
  }

  .main__content--json-parser input {
    width: 400px;
    margin: 0 5px;
  }

  .main__content--json-parser button {
    margin: 0 5px;
  }

  .main__content--settings__block {
    display: flex;
    justify-content: space-between;
  }

  .main__content--settings__block .main__content--settings__block__search-block {
    display: flex;
    align-items: center;
  }

  .main__content--settings__block p {
    margin: 20px 5px;
  }

  .main__content--settings__block p select {
    width: 60px;
    margin: 0 5px;
  }

  td, th {
    padding: 5px 10px;
  }

  .main__content--under-table__content {
    display: flex;
    justify-content: space-between;
  }

  .pagination {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: aliceblue;
    /*border-radius: 20px;*/
  }

  .pagination button {
    margin: 0 5px;
  }

  .pagination p {
    margin: 0px 5px;
    font-size: 18px;
  }
</style>
