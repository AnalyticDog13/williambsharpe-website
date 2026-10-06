/* Ben Wilson Pictures — 3D Image Universe (Sprite-based rectangles) */

(function () {

  // ── Texture manifest ──────────────────────────────────────────────────────
  var LOCAL_IMAGES = [
    // Add your own: 'images/photo01.jpg',
  ];

  var WIX_BASE = 'https://static.wixstatic.com/media/';
  var CDN_IMAGES = [
    WIX_BASE + 'f4188c_979e05a4cd394e29811ea7eb17789d22~mv2.jpeg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01/',
    WIX_BASE + 'f4188c_46c00e49949e40ec91b3b7d288dfdad7~mv2.jpg/v1/fill/w_400,h_600,al_c,q_80,usm_0.66_1.00_0.01/',
    WIX_BASE + 'f4188c_014dc79a81ee48ecb24c61f7b2c823f7~mv2.jpeg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01/',
    WIX_BASE + 'f4188c_3af659f5f5fa427f8e5e0efdbf635cc4~mv2_d_5616_3744_s_4_2.jpg/v1/fill/w_600,h_400,al_c,q_80,usm_0.66_1.00_0.01/',
    WIX_BASE + 'f4188c_7eb4fc6d029643c293bf6df3f107ae43~mv2.jpg/v1/fill/w_600,h_460,al_c,q_80,usm_0.66_1.00_0.01/',
  ];

  var UNSPLASH = [
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=70',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=70',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&q=70',
    'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&q=70',
    'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=500&q=70',
    'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=500&q=70',
    'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=500&q=70',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&q=70',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=70',
    'https://images.unsplash.com/photo-1542038374-814e4e1e7b82?w=500&q=70',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&q=70',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=70',
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=500&q=70',
    'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=500&q=70',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=70',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=70',
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=500&q=70',
    'https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?w=500&q=70',
    'https://images.unsplash.com/photo-1454922915609-78549ad709bb?w=500&q=70',
    'https://images.unsplash.com/photo-1520549233664-03f65c1d1327?w=500&q=70',
    'https://images.unsplash.com/photo-1473655545896-d8b2fe6f8f3d?w=500&q=70',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=70',
    'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=500&q=70',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&q=70',
    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=500&q=70',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=500&q=70',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=70',
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=500&q=70',
    'https://images.unsplash.com/photo-1472195870936-d88c957b57e0?w=500&q=70',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&q=70',
    'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=500&q=70',
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=500&q=70',
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=500&q=70',
    'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=500&q=70',
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=500&q=70',
    'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=500&q=70',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=70',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&q=70',
    'https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?w=500&q=70',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=70',
    'https://images.unsplash.com/photo-1549488344-cbb6c34abfe5?w=500&q=70',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=70',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=70',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500&q=70',
    'https://images.unsplash.com/photo-1454986567977-df6dad0d6ddd?w=500&q=70',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=70',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=70',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=70',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=70',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=70',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=500&q=70',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=70',
    'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=500&q=70',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=70',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=70',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=70',
    'https://images.unsplash.com/photo-1569913486515-b74bf7751574?w=500&q=70',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=70',
    'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=500&q=70',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&q=70',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=500&q=70',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=70',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&q=70',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&q=70',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=500&q=70',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=500&q=70',
    'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=500&q=70',
    'https://images.unsplash.com/photo-1504199367641-aba8151af406?w=500&q=70',
    'https://images.unsplash.com/photo-1492447273231-0f8fecec1e3a?w=500&q=70',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=70',
    'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=500&q=70',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=70',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=70',
    'https://images.unsplash.com/photo-1445053023192-8d45cb66099d?w=500&q=70',
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&q=70',
    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=500&q=70',
    'https://images.unsplash.com/photo-1500522144261-ea64433bbe27?w=500&q=70',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=70',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500&q=70',
    'https://images.unsplash.com/photo-1504870712357-65ea720d6078?w=500&q=70',
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=500&q=70',
    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=500&q=70',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=70',
    'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=500&q=70',
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?w=500&q=70',
    'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=500&q=70',
    'https://images.unsplash.com/photo-1520962922320-2038eebab146?w=500&q=70',
    'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=500&q=70',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500&q=70',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=70',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&q=70',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&q=70',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&q=70',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500&q=70',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&q=70',
    'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=500&q=70',
  ];

  var PARTICLE_COUNT = 80;

  function buildTextureList() {
    var all = LOCAL_IMAGES.concat(CDN_IMAGES, UNSPLASH);
    for (var i = all.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
    }
    var result = [];
    for (var k = 0; k < PARTICLE_COUNT; k++) result.push(all[k % all.length]);
    return result;
  }

  function randomSphericalPos(radius) {
    var theta = 2 * Math.PI * Math.random();
    var phi   = Math.acos(2 * Math.random() - 1);
    var r     = radius * Math.cbrt(Math.random());
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }

  // ── Renderer & Scene ─────────────────────────────────────────────────────
  var canvas   = document.getElementById('universe-canvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f3ef);

  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 70);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping    = true;
  controls.dampingFactor    = 0.07;
  controls.rotateSpeed      = 0.55;
  controls.zoomSpeed        = 1.0;
  controls.panSpeed         = 0.8;
  controls.minDistance      = 5;
  controls.maxDistance      = 200;
  controls.autoRotate       = true;
  controls.autoRotateSpeed  = 0.7;

  var idleTimer = null;
  canvas.addEventListener('pointerdown', function () {
    controls.autoRotate = false;
    canvas.style.cursor = 'grabbing';
    clearTimeout(idleTimer);
  });
  canvas.addEventListener('pointerup', function () {
    canvas.style.cursor = 'grab';
    idleTimer = setTimeout(function () { controls.autoRotate = true; }, 4000);
  });

  // ── Subtle background dust ────────────────────────────────────────────────
  (function () {
    var count = 2500;
    var geo   = new THREE.BufferGeometry();
    var pos   = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xbbbbcc, size: 0.28, transparent: true, opacity: 0.4, sizeAttenuation: true,
    })));
  })();

  // ── Photo sprites (rectangular billboards) ────────────────────────────────
  var textureLoader = new THREE.TextureLoader();
  textureLoader.crossOrigin = 'anonymous';

  var textureList = buildTextureList();
  var sprites     = [];
  var driftData   = [];

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var baseH    = 5 + Math.random() * 7;   // world-space height, width set after load
    var position = randomSphericalPos(60);
    var url      = textureList[i];

    var mat = new THREE.SpriteMaterial({
      transparent:     true,
      opacity:         0,
      depthWrite:      false,
      sizeAttenuation: true,
    });

    var sprite = new THREE.Sprite(mat);
    sprite.position.copy(position);
    sprite.visible = false;   // hidden until its image actually loads
    scene.add(sprite);
    sprites.push({ sprite: sprite, mat: mat });

    driftData.push({
      ax:    (Math.random() - 0.5) * 0.007,
      ay:    (Math.random() - 0.5) * 0.007,
      az:    (Math.random() - 0.5) * 0.005,
      phase: Math.random() * Math.PI * 2,
    });

    // Load texture → read real pixel dimensions → set correct aspect, then fade in
    (function (material, sp, h) {
      textureLoader.load(url, function (tex) {
        var imgW = tex.image.naturalWidth  || tex.image.width  || 1;
        var imgH = tex.image.naturalHeight || tex.image.height || 1;
        sp.scale.set(h * (imgW / imgH), h, 1);

        material.map = tex;
        material.needsUpdate = true;
        sp.visible = true;

        var op = 0;
        var iv = setInterval(function () {
          op = Math.min(op + 0.05, 0.95);
          material.opacity = op;
          if (op >= 0.95) clearInterval(iv);
        }, 25);
      }, undefined, function () {
        // Image failed — keep sprite hidden, no blank rectangle shown
        sp.visible = false;
      });
    })(mat, sprite, baseH);
  }

  // ── Render loop ───────────────────────────────────────────────────────────
  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    for (var i = 0; i < sprites.length; i++) {
      var d = driftData[i];
      var p = sprites[i].sprite.position;
      p.x += Math.sin(t * 0.3  + d.phase)       * d.ax;
      p.y += Math.cos(t * 0.25 + d.phase)       * d.ay;
      p.z += Math.sin(t * 0.2  + d.phase + 1.2) * d.az;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // ── Resize ────────────────────────────────────────────────────────────────
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
