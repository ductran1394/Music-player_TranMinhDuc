const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
const current = $(".current");
const durationTime = $(".durationTime");

function displayTimer() {
   const {duration, currentTime} = audio;

   current.textContent = FormatTimer(currentTime);

   if (!duration) {
      durationTime.textContent = "00:00";
   } else {
      durationTime.textContent = FormatTimer(duration);
   }
}

let timer = setInterval(displayTimer, 500);

function FormatTimer(number) {
   const minutes = Math.floor(number / 60);
   const seconds = Math.floor(number - minutes * 60);

   console.log("setInterval");
   return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

const app = {
   currentIndex: 0,
   isPlaying: false,
   isRandom: false,
   isRepeat: false,
   config: {},

   songs: [
      {
         name: "Havana",
         singer: "Camila Cabello",
         path: "./assets/songs/Havana.mp3",
         image: "./assets/img/Havana.jpg",
      },
      {
         name: "Never Be The Same",
         singer: "Camila Cabello",
         path: "./assets/songs/NeverBeTheSame.mp3",
         image: "./assets/img/NeverBeTheSame.jpg",
      },
      {
         name: "One Call Away",
         singer: "Charlie Puth",
         path: "./assets/songs/OneCallAway.mp3",
         image: "./assets/img/OneCallAway.jpg",
      },
      {
         name: "Señorita",
         singer: "Camila Cabello x Shawn Mendes",
         path: "./assets/songs/Senorita.mp3",
         image: "./assets/img/Senorita.jpg",
      },
      {
         name: "Closer",
         singer: "The Chainsmokers",
         path: "./assets/songs/Closer.mp3",
         image: "./assets/img/Closer.jpg",
      },
      {
         name: "Memories",
         singer: "Maroon 5",
         path: "./assets/songs/Memories.mp3",
         image: "./assets/img/Memories.jpg",
      },
   ],

   render: function () {
      const htmls = this.songs.map((song, index) => {
         return `
                        <div class="song ${
                           index === this.currentIndex ? "active" : ""
                        }" data-index="${index}">
                            <div class="thumb"
                                style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `;
      });
      playlist.innerHTML = htmls.join("");
   },
   defineProperties: function () {
      Object.defineProperty(this, "currentSong", {
         get: function () {
            return this.songs[this.currentIndex];
         },
      });
   },
   handleEvents: function () {
      const _this = this;
      const cdWidth = cd.offsetWidth;

      // Xử lý CD quay / dừng

      const cdThumbAnimate = cdThumb.animate([{transform: "rotate(360deg)"}], {
         duration: 10000, // 10 seconds
         iterations: Infinity,
      });
      cdThumbAnimate.pause();

      // Xử lý phóng to / thu nhỏ CD

      document.onscroll = function () {
         const scrollTop = window.scrollY || document.documentElement.scrollTop;
         const newCdWidth = cdWidth - scrollTop;

         cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
         cd.style.opacity = newCdWidth / cdWidth;
      };

      // Xử lý khi click play

      playBtn.onclick = function () {
         if (_this.isPlaying) {
            audio.pause();
         } else {
            audio.play();
            clearInterval(timer);
         }
      };

      // Khi song được play

      audio.onplay = function () {
         _this.isPlaying = true;
         player.classList.add("playing");
         cdThumbAnimate.play();
         timer = setInterval(displayTimer, 500);
      };

      // Khi song bị pause

      audio.onpause = function () {
         _this.isPlaying = false;
         player.classList.remove("playing");
         cdThumbAnimate.pause();
         clearInterval(timer);
      };

      // Khi tiến độ bài hát thay đổi

      audio.ontimeupdate = function () {
         if (audio.duration) {
            const progressPercent = Math.floor(
               (audio.currentTime / audio.duration) * 100
            );
            progress.value = progressPercent;
         }
      };

      // Xử lý khi tua song

      progress.onchange = function (e) {
         const seekTime = (audio.duration / 100) * e.target.value;
         audio.currentTime = seekTime;
      };

      // Khi next song

      nextBtn.onclick = function () {
         if (_this.isRandom) {
            _this.playRandomSong();
         } else {
            _this.nextSong();
         }
         audio.play();
         _this.render();
         _this.scrollToActiveSong();
      };

      // Khi prev song

      prevBtn.onclick = function () {
         if (_this.isRandom) {
            _this.playRandomSong();
         } else {
            _this.prevSong();
         }
         audio.play();
         _this.render();
         _this.scrollToActiveSong();
      };

      // Xử lý bật / tắt random song

      randomBtn.onclick = function (e) {
         _this.isRandom = !_this.isRandom;

         randomBtn.classList.toggle("active", _this.isRandom);
      };

      // Xử lý lặp lại một song

      repeatBtn.onclick = function (e) {
         _this.isRepeat = !_this.isRepeat;

         repeatBtn.classList.toggle("active", _this.isRepeat);
      };

      // Xử lý next song khi audio ended

      audio.onended = function () {
         if (_this.isRepeat) {
            audio.play();
         } else {
            nextBtn.click();
         }
      };

      // Lắng nghe hành vi click vào playlist

      playlist.onclick = function (e) {
         const songNode = e.target.closest(".song:not(.active)");

         if (songNode || e.target.closest(".option")) {
            // Xử lý khi click vào song

            if (songNode) {
               _this.currentIndex = Number(songNode.dataset.index);
               _this.loadCurrentSong();
               _this.render();
               audio.play();
            }

            // Xử lý khi click vào song option

            if (e.target.closest(".option")) {
            }
         }
      };
   },
   scrollToActiveSong: function () {
      setTimeout(() => {
         $(".song.active").scrollIntoView({
            behavior: "smooth",
            block: "nearest",
         });
      }, 300);
   },
   loadCurrentSong: function () {
      heading.textContent = this.currentSong.name;
      cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
      audio.src = this.currentSong.path;
   },

   //  displayTimer: function () {
   //     const {duration, currentTime} = audio;
   //     if (!duration) {
   //        durationTime.textContent = "00:00";
   //     } else {
   //        durationTime.textContent = duration;
   //     }
   //  },

   nextSong: function () {
      this.currentIndex++;
      if (this.currentIndex >= this.songs.length) {
         this.currentIndex = 0;
      }
      this.loadCurrentSong();
   },
   prevSong: function () {
      this.currentIndex--;
      if (this.currentIndex < 0) {
         this.currentIndex = this.songs.length - 1;
      }
      this.loadCurrentSong();
   },
   playRandomSong: function () {
      let newIndex;
      do {
         newIndex = Math.floor(Math.random() * this.songs.length);
      } while (newIndex === this.currentIndex);

      this.currentIndex = newIndex;
      this.loadCurrentSong();
   },
   start: function () {
      // Định nghĩa các thuộc tính cho object

      this.defineProperties();

      // Lắng nghe / xử lý các sự kiện (DOM events)
      this.handleEvents();

      // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
      this.loadCurrentSong();

      // Render playlist
      this.render();

      // Hiển thị trạng thái ban đầu của button repeat & random
      randomBtn.classList.toggle("active", this.isRandom);
      repeatBtn.classList.toggle("active", this.isRepeat);
   },
};

app.start();
